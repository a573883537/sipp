let currentTemplate = null;

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

function loadTemplate(templateKey) {
    const template = templates[templateKey];
    if (!template) return;

    currentTemplate = templateKey;
    
    const scenarioName = document.getElementById('scenario-name');
    scenarioName.value = template.name;

    const xmlContent = document.getElementById('xml-content');
    xmlContent.value = template.xml;

    renderVisualView(template);
    
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
    document.getElementById('btn-download').addEventListener('click', downloadXML);
    document.getElementById('btn-validate').addEventListener('click', validateXML);
    
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
