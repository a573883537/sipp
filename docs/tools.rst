Useful tools aside SIPp
=======================



SIPp Scenario Designer
``````````````````````

The **SIPp Scenario Designer** is a browser-based visual editor for creating and editing SIPp XML scenarios. It provides pre-built templates for common SIP testing patterns and supports both visual and XML editing modes.

**Features:**

* Pre-built templates: UAC, UAS, 3PCC, RTP playback, and SRTP scenarios
* Dual view modes: Visual flow diagram and XML editor
* Built-in XML validation
* Export scenarios as XML files ready for SIPp
* No installation required - works in any modern browser
* Integrated SIPp CLI usage examples

**Location:** ``tools/web-scenario-designer/``

**Quick Start:**

1. Open ``tools/web-scenario-designer/index.html`` in a web browser
2. Select a template (UAC, UAS, 3PCC, RTP, or SRTP)
3. Customize in Visual or XML view
4. Download the XML scenario
5. Run with SIPp: ``sipp -sf scenario.xml [destination]``

**Hosting the Designer:**

The designer is a static web application that can be served locally or hosted on any web server:

.. code-block:: bash

    # Using Python
    cd tools/web-scenario-designer
    python3 -m http.server 8080
    # Open http://localhost:8080

    # Using Node.js
    cd tools/web-scenario-designer
    npx serve .

    # Using the included script
    cd tools/web-scenario-designer
    ./serve.sh

**Documentation:** See ``tools/web-scenario-designer/README.md`` for detailed workflow examples, template descriptions, and tips for aligning scenarios with SIPp CLI usage.



JEdit
`````

`JEdit <http://www.jedit.org/>`_ is a GNU GPL text editor written in
Java, and available on almost all platforms. It's extremely powerful
and can be used to edit SIPp scenarios with syntax checking if you put
the DTD (`sipp.dtd <https://github.com/SIPp/sipp/raw/master/sipp.dtd>`_) in the same directory as your XML scenario.



Wireshark/tshark
````````````````

`Wireshark <https://www.wireshark.org/>`_ is a GNU GPL protocol
analyzer. It was formerly known as Ethereal. It supports SIP/SDP/RTP.





SIP callflow
````````````

When tracing SIP calls, it is very useful to be able to get a call
flow from an wireshark trace. The "callflow" tool allows you to do
that in a graphical way: `callflow <http://callflow.sourceforge.net/>`_

An equivalent exist if you want to generate HTML only call flows
`http://www.iptel.org/~sipsc/`_

.. _http://www.iptel.org/~sipsc/: https://web.archive.org/web/20120106005622/https://www.iptel.org/~sipsc/
