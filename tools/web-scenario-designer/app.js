let configurationPanelsInitialized = false;
let currentTemplate = null;

const TRANSPORT_FLAGS = {
    udp: 'u1',
    tcp: 't1',
    tls: 'tls',
    sctp: 's1'
};

const FIELD_METADATA = {
    callMode: "Switch between rate-based pacing (-r/-rp) and concurrent user pools (-users) detailed in SIPp's traffic control documentation.",
    callRate: "Applies the -r option to control how many new calls start each second.",
    ratePeriod: "Maps to -rp for the interval between batches of calls (milliseconds).",
    userCount: "Sets the -users option to maintain a pool of concurrent subscribers.",
    maxConcurrent: "Uses -l to limit the number of simultaneous open calls.",
    maxCalls: "Uses -m so SIPp exits after the specified call count.",
    callDuration: "Corresponds to -d to enforce a pause/duration in milliseconds.",
    localAddress: "Uses -i to bind SIP signalling to a specific local IP/interface.",
    localPort: "Uses -p to choose the local SIP port (defaults to 5060).",
    remoteAddress: "Destination host supplied as CLI argument.",
    remotePort: "Destination port appended to the host, e.g. 192.0.2.15:5080.",
    transport: "Maps to -t transport (u1=UDP, t1=TCP, tls=TLS, s1=SCTP).",
    tlsToggle: "Expose TLS certificate settings (-tls_cert/-tls_key/-tls_ca/-tls_crl/-tls_version) when transport is TLS.",
    tlsCertificate: "Path to the PEM certificate presented during TLS handshake (-tls_cert).",
    tlsKey: "PEM private key paired with the certificate (-tls_key).",
    tlsCa: "Trusted CA bundle for verifying peers (-tls_ca).",
    tlsCrl: "Optional certificate revocation list (-tls_crl).",
    tlsVersion: "Optional TLS protocol override (-tls_version).",
    enableRtp: "Enable RTP features such as PCAP playback or echo (see media.rst and rtpstream.cpp).",
    mediaMode: "Choose PCAP playback, RTP echo or custom media handling.",
    codec: "Advertised codec in SDP (PCMU, PCMA, G722, G729, iLBC).",
    pcapFile: "Primary PCAP stream to replay through SIPp's PCAP play capability.",
    enablePlayback: "Toggle exec play_pcap_audio actions for media replay.",
    enableEcho: "Enable SIPp's RTP echo responder described in media.rst.",
    dtmfPcap: "Optional RFC2833 DTMF PCAP sent after playback.",
    enableSrtp: "Use SRTP encryption/decryption via jlsrtp.",
    srtpProfile: "Select an SRTP crypto suite supported by jlsrtp.",
    srtpMasterKey: "Base64 encoded 16 byte SRTP master key.",
    srtpMasterSalt: "Base64 encoded 14 byte SRTP master salt."
};

const DEFAULT_CONFIGURATION = {
    call: {
        mode: 'rate',
        callRate: 10,
        ratePeriod: 1000,
        maxConcurrent: 0,
        maxCalls: 0,
        userCount: 50,
        callDuration: 0
    },
    network: {
        localAddress: '0.0.0.0',
        localPort: 5060,
        remoteAddress: '192.168.1.100',
        remotePort: 5060,
        transport: 'udp',
        tls: {
            enabled: false,
            certificate: 'cacert.pem',
            key: 'cakey.pem',
            ca: '',
            crl: '',
            version: ''
        }
    },
    media: {
        enableRtp: false,
        mediaMode: 'playback',
        codec: 'PCMU/8000',
        pcapFile: 'pcap/g711a.pcap',
        enablePlayback: true,
        enableEcho: false,
        dtmfPcap: '',
        enableSrtp: false,
        srtpProfile: 'AES_CM_128_HMAC_SHA1_80',
        srtpMasterKey: '',
        srtpMasterSalt: ''
    }
};

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

let configurationState = deepClone(DEFAULT_CONFIGURATION);

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function initializeConfigurationPanels() {
    if (configurationPanelsInitialized) {
        return;
    }

    applyFieldMetadata();
    attachConfigurationListeners();
    syncFormsWithState();
    updateSummary();

    configurationPanelsInitialized = true;
}

function applyFieldMetadata() {
    document.querySelectorAll('[data-metadata]').forEach(element => {
        const key = element.dataset.metadata;
        if (key && FIELD_METADATA[key]) {
            element.textContent = FIELD_METADATA[key];
        }
    });
}

function attachConfigurationListeners() {
    const inputs = document.querySelectorAll('.config-panel [data-section]');
    inputs.forEach(element => {
        const handler = event => handleFieldChange(event);
        element.addEventListener('change', handler);
        if (element.tagName === 'INPUT' && element.type !== 'checkbox' && element.type !== 'radio') {
            element.addEventListener('input', handler);
        }
    });
}

function handleFieldChange(event) {
    const input = event.target || event;
    if (!input || !input.dataset) {
        return;
    }

    const section = input.dataset.section;
    const fieldPath = input.dataset.field;
    if (!section || !fieldPath) {
        return;
    }

    const parsedValue = parseInputValue(input);
    const errorMessage = validateField(section, fieldPath, parsedValue);
    if (errorMessage) {
        showFieldError(input, errorMessage);
        return;
    }

    clearFieldError(input);

    const coercedValue = coerceValue(section, fieldPath, parsedValue);
    updateStateValue(section, fieldPath, coercedValue);

    applySideEffects(section, fieldPath, coercedValue);
    updateSummary();
}

function parseInputValue(input) {
    if (input.type === 'checkbox') {
        return input.checked;
    }

    if (input.type === 'number') {
        if (input.value === '') {
            return null;
        }
        return Number(input.value);
    }

    const value = input.value.trim();
    return value === '' ? null : value;
}

function validateField(section, fieldPath, value) {
    const key = `${section}.${fieldPath}`;
    switch (key) {
        case 'call.mode':
            if (!value || (value !== 'rate' && value !== 'users')) {
                return 'Select a valid traffic model.';
            }
            return '';
        case 'call.callRate':
            if (configurationState.call.mode === 'rate') {
                if (value === null) return 'Call rate is required.';
                if (Number.isNaN(value)) return 'Enter a numeric value.';
                if (value <= 0) return 'Call rate must be greater than zero.';
                if (value > 100000) return 'Call rate is too large.';
            }
            return '';
        case 'call.ratePeriod':
            if (configurationState.call.mode === 'rate') {
                if (value === null) return 'Rate period is required.';
                if (Number.isNaN(value)) return 'Enter a numeric value.';
                if (value < 1) return 'Rate period must be at least 1 ms.';
                if (value > 60000) return 'Rate period should stay under 60000 ms.';
            }
            return '';
        case 'call.userCount':
            if (configurationState.call.mode === 'users') {
                if (value === null) return 'User count is required.';
                if (Number.isNaN(value)) return 'Enter a numeric value.';
                if (!Number.isInteger(value)) return 'User count must be a whole number.';
                if (value < 1) return 'User count must be at least 1.';
            }
            return '';
        case 'call.maxConcurrent':
        case 'call.maxCalls':
            if (value === null) return '';
            if (Number.isNaN(value)) return 'Enter a numeric value.';
            if (!Number.isInteger(value)) return 'Use a whole number.';
            if (value < 0) return 'Value cannot be negative.';
            return '';
        case 'call.callDuration':
            if (value === null) return '';
            if (Number.isNaN(value)) return 'Enter a numeric value.';
            if (value < 0) return 'Duration cannot be negative.';
            return '';
        case 'network.localAddress':
            if (value === null) return '';
            if (value.length > 255) return 'Address is too long.';
            return '';
        case 'network.localPort':
            if (value === null) return 'Local port is required.';
            if (Number.isNaN(value)) return 'Enter a numeric port.';
            if (!Number.isInteger(value)) return 'Port must be a whole number.';
            if (value < 1 || value > 65535) return 'Port must be between 1 and 65535.';
            return '';
        case 'network.remoteAddress':
            if (!value) return 'Remote address is required.';
            if (value.length > 255) return 'Address is too long.';
            return '';
        case 'network.remotePort':
            if (value === null) return 'Remote port is required.';
            if (Number.isNaN(value)) return 'Enter a numeric port.';
            if (!Number.isInteger(value)) return 'Port must be a whole number.';
            if (value < 1 || value > 65535) return 'Port must be between 1 and 65535.';
            return '';
        case 'network.transport':
            if (!value || !TRANSPORT_FLAGS[value]) {
                return 'Select a supported transport.';
            }
            return '';
        case 'network.tls.enabled':
            if (value && configurationState.network.transport !== 'tls') {
                return 'Select TLS transport to customise TLS options.';
            }
            return '';
        case 'network.tls.certificate':
        case 'network.tls.key':
            if (configurationState.network.transport === 'tls' && configurationState.network.tls.enabled) {
                if (!value) {
                    return key.endsWith('certificate') ? 'Certificate file is required.' : 'Private key file is required.';
                }
            }
            return '';
        case 'network.tls.ca':
        case 'network.tls.crl':
            return '';
        case 'network.tls.version':
            if (!value) return '';
            if (!['1.0', '1.1', '1.2', '1.3'].includes(value)) {
                return 'Unsupported TLS version.';
            }
            return '';
        case 'media.mediaMode':
            if (configurationState.media.enableRtp && !value) {
                return 'Select a media mode.';
            }
            return '';
        case 'media.codec':
            if (configurationState.media.enableRtp && !value) {
                return 'Select a codec.';
            }
            return '';
        case 'media.pcapFile':
            if (configurationState.media.enableRtp && configurationState.media.mediaMode === 'playback') {
                if (!value) return 'Provide a PCAP file.';
                if (!value.endsWith('.pcap')) return 'PCAP path must end with .pcap.';
            }
            return '';
        case 'media.dtmfPcap':
            if (!value) return '';
            if (!value.endsWith('.pcap')) return 'DTMF PCAP must end with .pcap.';
            return '';
        case 'media.enableSrtp':
            if (value && !configurationState.media.enableRtp) {
                return 'Enable RTP before SRTP.';
            }
            return '';
        case 'media.srtpProfile':
            if (configurationState.media.enableRtp && configurationState.media.enableSrtp && !value) {
                return 'Select an SRTP profile.';
            }
            return '';
        case 'media.srtpMasterKey':
        case 'media.srtpMasterSalt':
            if (configurationState.media.enableRtp && configurationState.media.enableSrtp) {
                if (!value) {
                    return key.endsWith('Key') ? 'SRTP master key is required.' : 'SRTP master salt is required.';
                }
                if (!/^[A-Za-z0-9+/=]+$/.test(value)) {
                    return 'Use base64 encoded material.';
                }
                if (key.endsWith('Key') && value.length < 22) {
                    return 'Master key should represent 16 bytes in base64.';
                }
                if (key.endsWith('Salt') && value.length < 18) {
                    return 'Master salt should represent 14 bytes in base64.';
                }
            }
            return '';
        default:
            return '';
    }
}

function showFieldError(input, message) {
    if (!input) return;
    input.classList.add('input-invalid');
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('input-invalid');
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function coerceValue(section, fieldPath, value) {
    if (value === null || typeof value === 'boolean') {
        return value;
    }

    const key = `${section}.${fieldPath}`;
    if (['call.callRate'].includes(key)) {
        return Number(value);
    }

    if ([
        'call.ratePeriod',
        'call.userCount',
        'call.maxConcurrent',
        'call.maxCalls',
        'call.callDuration',
        'network.localPort',
        'network.remotePort'
    ].includes(key)) {
        return Math.round(Number(value));
    }

    return value;
}

function updateStateValue(section, fieldPath, value) {
    const segments = fieldPath.split('.');
    let target = configurationState[section];
    for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i];
        if (!target[key]) {
            target[key] = {};
        }
        target = target[key];
    }
    target[segments[segments.length - 1]] = value;
}

function getStateValue(section, fieldPath) {
    const segments = fieldPath.split('.');
    let value = configurationState[section];
    for (const key of segments) {
        if (value == null) {
            return null;
        }
        value = value[key];
    }
    return value;
}

function setInputValue(element, value) {
    if (!element) return;

    if (element.type === 'checkbox') {
        element.checked = Boolean(value);
    } else if (element.tagName === 'SELECT') {
        element.value = value !== null && value !== undefined ? String(value) : '';
    } else if (element.type === 'number') {
        element.value = value !== null && value !== undefined ? value : '';
    } else {
        element.value = value !== null && value !== undefined ? value : '';
    }
}

function setHidden(target, hidden) {
    if (!target) return;

    if (NodeList.prototype.isPrototypeOf(target) || Array.isArray(target)) {
        target.forEach(el => setHidden(el, hidden));
        return;
    }

    target.classList.toggle('is-hidden', hidden);
}

function applySideEffects(section, fieldPath, value) {
    if (section === 'call' && fieldPath === 'mode') {
        if (value === 'rate') {
            if (!configurationState.call.callRate) {
                configurationState.call.callRate = DEFAULT_CONFIGURATION.call.callRate;
            }
            if (!configurationState.call.ratePeriod) {
                configurationState.call.ratePeriod = DEFAULT_CONFIGURATION.call.ratePeriod;
            }
            setInputValue(document.getElementById('call-rate'), configurationState.call.callRate);
            setInputValue(document.getElementById('call-rate-period'), configurationState.call.ratePeriod);
        } else {
            if (!configurationState.call.userCount) {
                configurationState.call.userCount = DEFAULT_CONFIGURATION.call.userCount;
            }
            setInputValue(document.getElementById('call-user-count'), configurationState.call.userCount);
        }
        updateCallModeVisibility();
    } else if (section === 'network' && fieldPath === 'transport') {
        if (value === 'tls') {
            configurationState.network.tls.enabled = true;
        } else {
            configurationState.network.tls.enabled = false;
        }
        const tlsToggle = document.getElementById('network-tls-enable');
        if (tlsToggle) {
            tlsToggle.checked = configurationState.network.tls.enabled;
        }
        updateTlsFieldState();
    } else if (section === 'network' && fieldPath === 'tls.enabled') {
        if (configurationState.network.tls.enabled) {
            if (!configurationState.network.tls.certificate) {
                configurationState.network.tls.certificate = DEFAULT_CONFIGURATION.network.tls.certificate;
            }
            if (!configurationState.network.tls.key) {
                configurationState.network.tls.key = DEFAULT_CONFIGURATION.network.tls.key;
            }
            setInputValue(document.getElementById('network-tls-cert'), configurationState.network.tls.certificate);
            setInputValue(document.getElementById('network-tls-key'), configurationState.network.tls.key);
        }
        updateTlsFieldState();
    } else if (section === 'media' && fieldPath === 'enableRtp') {
        if (!configurationState.media.enableRtp) {
            configurationState.media.enableSrtp = false;
            const srtpToggle = document.getElementById('media-enable-srtp');
            if (srtpToggle) {
                srtpToggle.checked = false;
            }
        }
        updateMediaFieldVisibility();
    } else if (section === 'media' && (fieldPath === 'mediaMode' || fieldPath === 'enableSrtp')) {
        updateMediaFieldVisibility();
    }
}

function updateCallModeVisibility() {
    const isRate = configurationState.call.mode === 'rate';
    setHidden(document.querySelectorAll('.call-rate-field'), !isRate);
    setHidden(document.querySelectorAll('.call-users-field'), isRate);
}

function updateTlsFieldState() {
    const isTransportTls = configurationState.network.transport === 'tls';
    const tlsToggle = document.getElementById('network-tls-enable');
    const tlsFields = document.getElementById('tls-fields');

    if (tlsToggle) {
        tlsToggle.disabled = !isTransportTls;
        tlsToggle.checked = isTransportTls && configurationState.network.tls.enabled;
    }

    if (tlsFields) {
        const show = isTransportTls && configurationState.network.tls.enabled;
        tlsFields.classList.toggle('is-hidden', !show);
        tlsFields.querySelectorAll('input, select').forEach(element => {
            element.disabled = !show;
        });
    }
}

function updateMediaFieldVisibility() {
    const enableRtp = configurationState.media.enableRtp;
    const rtpFields = document.getElementById('rtp-fields');
    if (rtpFields) {
        rtpFields.classList.toggle('is-hidden', !enableRtp);
        rtpFields.querySelectorAll('input, select').forEach(element => {
            if (element.id === 'media-enable-srtp') {
                return;
            }
            element.disabled = !enableRtp;
        });
    }

    const mode = configurationState.media.mediaMode;
    const showPlayback = enableRtp && mode === 'playback';
    setHidden(document.getElementById('media-pcap-field'), !showPlayback);
    setHidden(document.getElementById('media-playback-field'), !showPlayback);
    setHidden(document.getElementById('media-dtmf-field'), !showPlayback);
    setHidden(document.getElementById('media-echo-field'), !enableRtp);

    const srtpToggle = document.getElementById('media-enable-srtp');
    if (srtpToggle) {
        srtpToggle.disabled = !enableRtp;
        srtpToggle.checked = enableRtp && configurationState.media.enableSrtp;
    }

    const srtpFields = document.getElementById('srtp-fields');
    if (srtpFields) {
        const showSrtp = enableRtp && configurationState.media.enableSrtp;
        srtpFields.classList.toggle('is-hidden', !showSrtp);
        srtpFields.querySelectorAll('input, select').forEach(element => {
            element.disabled = !showSrtp;
        });
    }
}

function syncFormsWithState() {
    const inputs = document.querySelectorAll('.config-panel [data-section]');
    inputs.forEach(element => {
        const section = element.dataset.section;
        const fieldPath = element.dataset.field;
        setInputValue(element, getStateValue(section, fieldPath));
        clearFieldError(element);
    });

    updateCallModeVisibility();
    updateTlsFieldState();
    updateMediaFieldVisibility();
}

function formatNumber(value, decimals = 0, fallback = 'Not set') {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return fallback;
    }
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatLimit(value) {
    if (!value || value <= 0) {
        return 'Unlimited';
    }
    return formatNumber(value, 0);
}

function formatSecret(value) {
    if (!value) {
        return 'Not set';
    }
    return `Configured (${value.length} chars)`;
}

function quoteIfNeeded(value) {
    if (value === null || value === undefined) return '';
    const text = String(value);
    return /\s/.test(text) ? `"${text}"` : text;
}

function buildDestination(address, port) {
    if (!address) return '';
    if (!port) return address;
    return `${address}:${port}`;
}

function buildCliPreview() {
    const args = ['sipp', '-sf scenario.xml'];
    const { call, network } = configurationState;

    if (call.mode === 'rate') {
        if (call.callRate) {
            args.push(`-r ${call.callRate}`);
        }
        if (call.ratePeriod && call.ratePeriod !== DEFAULT_CONFIGURATION.call.ratePeriod) {
            args.push(`-rp ${call.ratePeriod}`);
        }
    } else if (call.mode === 'users' && call.userCount) {
        args.push(`-users ${call.userCount}`);
    }

    if (call.maxConcurrent) {
        args.push(`-l ${call.maxConcurrent}`);
    }
    if (call.maxCalls) {
        args.push(`-m ${call.maxCalls}`);
    }
    if (call.callDuration) {
        args.push(`-d ${call.callDuration}`);
    }

    if (network.localAddress && network.localAddress !== '0.0.0.0') {
        args.push(`-i ${quoteIfNeeded(network.localAddress)}`);
    }
    if (network.localPort && network.localPort !== 5060) {
        args.push(`-p ${network.localPort}`);
    }
    if (network.transport && TRANSPORT_FLAGS[network.transport]) {
        args.push(`-t ${TRANSPORT_FLAGS[network.transport]}`);
    }

    if (network.transport === 'tls' && network.tls.enabled) {
        if (network.tls.certificate) {
            args.push(`-tls_cert ${quoteIfNeeded(network.tls.certificate)}`);
        }
        if (network.tls.key) {
            args.push(`-tls_key ${quoteIfNeeded(network.tls.key)}`);
        }
        if (network.tls.ca) {
            args.push(`-tls_ca ${quoteIfNeeded(network.tls.ca)}`);
        }
        if (network.tls.crl) {
            args.push(`-tls_crl ${quoteIfNeeded(network.tls.crl)}`);
        }
        if (network.tls.version) {
            args.push(`-tls_version ${network.tls.version}`);
        }
    }

    const destination = buildDestination(network.remoteAddress, network.remotePort);
    if (destination) {
        args.push(destination);
    } else {
        args.push('[remote_host]:5060');
    }

    return args.join(' ');
}

function updateSummary() {
    const summary = document.getElementById('configuration-summary');
    if (!summary) {
        return;
    }

    const { call, network, media } = configurationState;

    const callLines = [];
    if (call.mode === 'rate') {
        callLines.push(`<li><strong>Mode:</strong> Rate based – ${formatNumber(call.callRate, 1, 'Not set')} calls/sec every ${formatNumber(call.ratePeriod, 0, '1,000')} ms</li>`);
    } else {
        callLines.push(`<li><strong>Mode:</strong> Concurrent users – ${formatNumber(call.userCount, 0, 'Not set')} users</li>`);
    }
    callLines.push(`<li><strong>Max concurrent:</strong> ${formatLimit(call.maxConcurrent)}</li>`);
    callLines.push(`<li><strong>Total calls:</strong> ${formatLimit(call.maxCalls)}</li>`);
    callLines.push(`<li><strong>Duration/pause:</strong> ${call.callDuration ? `${formatNumber(call.callDuration, 0)} ms` : 'Scenario controlled'}</li>`);

    const networkLines = [];
    const remote = buildDestination(network.remoteAddress, network.remotePort) || 'Not set';
    networkLines.push(`<li><strong>Local binding:</strong> ${network.localAddress || '0.0.0.0'}:${formatNumber(network.localPort, 0, '5060')}</li>`);
    networkLines.push(`<li><strong>Remote target:</strong> ${remote}</li>`);
    networkLines.push(`<li><strong>Transport:</strong> ${(network.transport || '').toUpperCase() || 'Not set'}</li>`);
    if (network.transport === 'tls') {
        const tlsStatus = network.tls.enabled ? 'Custom certificate settings applied' : 'Default TLS settings';
        networkLines.push(`<li><strong>TLS:</strong> ${tlsStatus}</li>`);
        if (network.tls.enabled) {
            networkLines.push(`<li><strong>Certificate:</strong> ${network.tls.certificate || 'Not set'}</li>`);
            networkLines.push(`<li><strong>Private key:</strong> ${network.tls.key || 'Not set'}</li>`);
            if (network.tls.ca) {
                networkLines.push(`<li><strong>CA bundle:</strong> ${network.tls.ca}</li>`);
            }
            if (network.tls.version) {
                networkLines.push(`<li><strong>Protocol:</strong> TLS ${network.tls.version}</li>`);
            }
        }
    } else {
        networkLines.push('<li><strong>TLS:</strong> Not applicable</li>');
    }

    const mediaLines = [];
    if (!media.enableRtp) {
        mediaLines.push('<li><strong>RTP:</strong> Disabled</li>');
    } else {
        const modeLabels = {
            playback: 'PCAP playback',
            echo: 'RTP echo loop',
            custom: 'Custom actions'
        };
        mediaLines.push(`<li><strong>RTP mode:</strong> ${modeLabels[media.mediaMode] || media.mediaMode}</li>`);
        mediaLines.push(`<li><strong>Codec:</strong> ${media.codec}</li>`);
        if (media.mediaMode === 'playback') {
            mediaLines.push(`<li><strong>PCAP:</strong> ${media.pcapFile || 'Not set'}</li>`);
            mediaLines.push(`<li><strong>Playback actions:</strong> ${media.enablePlayback ? 'Enabled' : 'Disabled'}</li>`);
            if (media.dtmfPcap) {
                mediaLines.push(`<li><strong>DTMF PCAP:</strong> ${media.dtmfPcap}</li>`);
            }
        }
        mediaLines.push(`<li><strong>Echo:</strong> ${media.enableEcho ? 'Enabled' : 'Disabled'}</li>`);
        if (media.enableSrtp) {
            mediaLines.push(`<li><strong>SRTP profile:</strong> ${media.srtpProfile}</li>`);
            mediaLines.push(`<li><strong>Master key:</strong> ${formatSecret(media.srtpMasterKey)}</li>`);
            mediaLines.push(`<li><strong>Master salt:</strong> ${formatSecret(media.srtpMasterSalt)}</li>`);
        } else {
            mediaLines.push('<li><strong>SRTP:</strong> Disabled</li>');
        }
    }

    const cliPreview = escapeHtml(buildCliPreview());

    summary.innerHTML = `
        <h2>Configuration Summary</h2>
        <div class="summary-section">
            <h3>Call pacing</h3>
            <ul class="summary-list">
                ${callLines.join('\n')}
            </ul>
        </div>
        <div class="summary-section">
            <h3>Network</h3>
            <ul class="summary-list">
                ${networkLines.join('\n')}
            </ul>
        </div>
        <div class="summary-section">
            <h3>Media</h3>
            <ul class="summary-list">
                ${mediaLines.join('\n')}
            </ul>
        </div>
        <div class="summary-section">
            <h3>CLI preview</h3>
            <pre class="summary-cli">${cliPreview}</pre>
        </div>
    `;
}

function applyTemplateDefaults(templateKey) {
    const nextState = deepClone(DEFAULT_CONFIGURATION);

    switch (templateKey) {
        case 'uac':
            nextState.call.mode = 'rate';
            nextState.call.callRate = 10;
            nextState.network.transport = 'udp';
            nextState.media.enableRtp = false;
            break;
        case 'uas':
            nextState.call.mode = 'users';
            nextState.call.userCount = 5;
            nextState.network.transport = 'udp';
            break;
        case '3pcc':
            nextState.call.mode = 'rate';
            nextState.call.callRate = 5;
            nextState.call.maxConcurrent = 2;
            nextState.media.enableRtp = true;
            nextState.media.mediaMode = 'custom';
            break;
        case 'rtp':
            nextState.media.enableRtp = true;
            nextState.media.mediaMode = 'playback';
            nextState.media.enablePlayback = true;
            nextState.media.pcapFile = 'pcap/g711a.pcap';
            break;
        case 'srtp':
            nextState.network.transport = 'tls';
            nextState.network.tls.enabled = true;
            nextState.media.enableRtp = true;
            nextState.media.mediaMode = 'playback';
            nextState.media.enablePlayback = true;
            nextState.media.enableSrtp = true;
            break;
        default:
            break;
    }

    configurationState = nextState;

    if (configurationPanelsInitialized) {
        syncFormsWithState();
        updateSummary();
    }
}

function loadTemplate(templateKey) {
    const template = templates[templateKey];
    if (!template) return;

    currentTemplate = templateKey;

    const scenarioName = document.getElementById('scenario-name');
    scenarioName.value = template.name;

    const xmlContent = document.getElementById('xml-content');
    xmlContent.value = template.xml;

    renderVisualView(template);
    applyTemplateDefaults(templateKey);
    updateCLICommand(templateKey);
}

function renderVisualView(template) {
    const visualCanvas = document.getElementById('visual-canvas');
    
    if (template.steps && template.steps.length > 0) {
        let html = `
            <div class="scenario-flow">
                <h2>${escapeHtml(template.name)}</h2>
                <p style="color: var(--text-light); margin-bottom: 2rem;">${escapeHtml(template.description)}</p>
        `;
        
        template.steps.forEach(step => {
            html += `
                <div class="flow-step ${step.type}">
                    <div class="step-icon">${step.icon}</div>
                    <div class="step-content">
                        <div class="step-title">${escapeHtml(step.title)}</div>
                        <div class="step-details">${escapeHtml(step.details)}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        visualCanvas.innerHTML = html;
    } else {
        visualCanvas.innerHTML = `
            <div class="empty-state">
                <h2>Empty Scenario</h2>
                <p>Switch to XML view to edit the scenario</p>
            </div>
        `;
    }
}

function updateCLICommand(templateKey) {
    const cliCommand = document.getElementById('cli-command');
    let command = 'sipp -sf scenario.xml';
    
    switch(templateKey) {
        case 'uac':
            command = 'sipp -sf scenario.xml -s service 192.168.1.100:5060';
            break;
        case 'uas':
            command = 'sipp -sf scenario.xml';
            break;
        case '3pcc':
            command = 'sipp -sf scenario.xml -3pcc 192.168.1.100:5060';
            break;
        case 'rtp':
            command = 'sipp -sf scenario.xml -s service 192.168.1.100:5060';
            break;
        case 'srtp':
            command = 'sipp -sf scenario.xml -s service 192.168.1.100:5060';
            break;
        default:
            command = 'sipp -sf scenario.xml [destination]';
    }
    
    cliCommand.textContent = command;
}

function downloadXML() {
    const xmlContent = document.getElementById('xml-content').value;
    const scenarioName = document.getElementById('scenario-name').value;
    const filename = scenarioName.toLowerCase().replace(/\s+/g, '_') + '.xml';
    
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyXML() {
    const xmlContent = document.getElementById('xml-content').value;
    
    navigator.clipboard.writeText(xmlContent).then(() => {
        alert('✅ XML copied to clipboard!');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = xmlContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ XML copied to clipboard!');
    });
}

function importXML() {
    const fileInput = document.getElementById('file-input');
    fileInput.click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const xmlContent = e.target.result;
            
            const validationResult = validateXMLBasic(xmlContent);
            if (!validationResult.valid) {
                alert('❌ XML Import Failed\n\n' + validationResult.errors.map(err => err.message).join('\n'));
                return;
            }

            const scenario = parseScenarioFromXML(xmlContent);
            
            document.getElementById('scenario-name').value = scenario.name;
            document.getElementById('xml-content').value = xmlContent;
            
            currentTemplate = null;
            renderImportedScenario(scenario);
            updateSummary();
            
            alert('✅ Scenario imported successfully!\n\nScenario: ' + scenario.name);
        } catch (error) {
            alert('❌ Import Error\n\n' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function renderImportedScenario(scenario) {
    const visualCanvas = document.getElementById('visual-canvas');
    
    let html = `
        <div class="scenario-flow">
            <h2>${escapeHtml(scenario.name)}</h2>
            <p style="color: var(--text-light); margin-bottom: 2rem;">Imported scenario with ${scenario.steps.length} steps</p>
    `;
    
    scenario.steps.forEach((step, index) => {
        const stepInfo = getStepInfo(step);
        html += `
            <div class="flow-step ${stepInfo.class}">
                <div class="step-icon">${stepInfo.icon}</div>
                <div class="step-content">
                    <div class="step-title">${escapeHtml(stepInfo.title)}</div>
                    <div class="step-details">${escapeHtml(stepInfo.details)}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    visualCanvas.innerHTML = html;
}

function getStepInfo(step) {
    switch (step.type) {
        case 'send':
            const sendMethod = (step.content || '').split(' ')[0] || 'MESSAGE';
            return {
                icon: '📤',
                title: `Send ${sendMethod}`,
                details: step.attributes.retrans ? 'With retransmissions' : '',
                class: 'send'
            };
        case 'recv':
            if (step.attributes.response) {
                return {
                    icon: '📥',
                    title: `Receive ${step.attributes.response}`,
                    details: step.attributes.optional === 'true' ? 'Optional' : '',
                    class: 'recv'
                };
            } else if (step.attributes.request) {
                return {
                    icon: '📥',
                    title: `Receive ${step.attributes.request}`,
                    details: step.attributes.optional === 'true' ? 'Optional' : '',
                    class: 'recv'
                };
            }
            return {
                icon: '📥',
                title: 'Receive message',
                details: step.attributes.optional === 'true' ? 'Optional' : '',
                class: 'recv'
            };
        case 'pause':
            const ms = step.attributes.milliseconds || 'default';
            return {
                icon: '⏸️',
                title: 'Pause',
                details: `${ms}ms`,
                class: 'pause'
            };
        case 'label':
            return {
                icon: '🏷️',
                title: 'Label',
                details: step.attributes.id || '',
                class: 'control'
            };
        case 'nop':
            return {
                icon: '⚙️',
                title: 'No operation',
                details: step.attributes.display || '',
                class: 'control'
            };
        default:
            return {
                icon: '❓',
                title: step.type,
                details: '',
                class: 'other'
            };
    }
}

function validateXML() {
    const xmlContent = document.getElementById('xml-content').value;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    
    if (parseError.length > 0) {
        alert('❌ XML Validation Failed\n\n' + parseError[0].textContent);
    } else {
        const scenario = xmlDoc.getElementsByTagName('scenario');
        if (scenario.length === 0) {
            alert('⚠️ Warning: No <scenario> element found in XML');
        } else {
            alert('✅ XML is well-formed!\n\nScenario: ' + (scenario[0].getAttribute('name') || 'Unnamed'));
        }
    }
}

function newScenario() {
    if (confirm('Start a new scenario? Any unsaved changes will be lost.')) {
        loadTemplate('blank');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeConfigurationPanels();

    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.getAttribute('data-template');
            loadTemplate(template);
        });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.editor-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            if (tab === 'visual') {
                document.getElementById('visual-editor').classList.add('active');
            } else if (tab === 'xml') {
                document.getElementById('xml-editor').classList.add('active');
            }
        });
    });

    document.getElementById('btn-new').addEventListener('click', newScenario);
    document.getElementById('btn-import').addEventListener('click', importXML);
    document.getElementById('btn-download').addEventListener('click', downloadXML);
    document.getElementById('btn-copy').addEventListener('click', copyXML);
    document.getElementById('btn-validate').addEventListener('click', validateXML);
    document.getElementById('file-input').addEventListener('change', handleFileImport);
    
    const modal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('btn-help');
    const closeBtn = document.querySelector('.close');
    
    btnHelp.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('scenario-name').addEventListener('input', (e) => {
        const xmlContent = document.getElementById('xml-content');
        const currentXml = xmlContent.value;
        const updated = currentXml.replace(
            /(<scenario name=")[^"]*(")/,
            `$1${e.target.value}$2`
        );
        xmlContent.value = updated;
        updateSummary();
    });

    document.getElementById('xml-content').addEventListener('input', () => {
        if (currentTemplate && templates[currentTemplate]) {
            const template = templates[currentTemplate];
            const xmlContent = document.getElementById('xml-content').value;
            const nameMatch = xmlContent.match(/<scenario name="([^"]*)"/);
            if (nameMatch) {
                document.getElementById('scenario-name').value = nameMatch[1];
            }
        }
    });
});
