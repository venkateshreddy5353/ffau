/*
        Ffau - A blocky-based editor for teaching HTML, CSS and Javascript.

				Developed by Pal Kerecsenyi, Geza Kerecsenyi and Oli Plant.
				Full details are avaliable at the Github repo: https://github.com/codeddraig/ffau
				Ffau editor will not work without its libraries. The best way to get all
					off this data at once is to grab the latest release version from the
					Github repo or to install via NPM.
				Ffau is open source software. This means you can re-mix, share and use
					it however you want, including for commercial purposes. However, you
					MUST provide attribution to the original authors if you do this.
				However, Ffau is provided with NO WARRANTY whatsoever, and by using this
					software, you agree to the terms of the MIT License.

				Copyright (c) 2017-19 The CodeDdraig Organisation

				THIS IS VERSION 1.0.0
*/

/* jshint esversion:6 */

function fontAwesome(icon) {
    let elem = document.createElement("i");
    elem.className = "fas fa-" + icon;
    return elem;
}

(function () {
    "use strict";
    Blockly.HSV_SATURATION = 1;
    Blockly.HSV_VALUE = 0.7;
}());

/**
 * Class representing a Ffau instance, including all components.
 */

class Ffau {
    /**
     * Initialise the Ffau instance in the document
     */
    constructor() {
        console.log("=========================");
        console.log('%c Ffau Editor ', 'background: #00d1b2; color: white;');
        console.log("A Blockly-based HTML editor made by the CodeDdraig organisation.");
        console.log("https://github.com/codeddraig/ffau");
        console.log("=========================\n");
    }

    /**
     * Generate an ID for a ffau component
     *
     * @param {HTMLElement} object - The element to generate an ID for
     * @param {string} objectType - The name of the component
     * @returns {string}
     */
    static generateID(object, objectType) {
        return object.id || "ffau-" + objectType + "-" + Math.floor(Math.random() * 10000);
    }

    /**
     * Inject the blockly editor (should be called first)
     *
     * @param {HTMLElement} frame - The frame to put the editor in
     * @param {HTMLElement} toolbox - The XML toolbox
     * @param {object} [options] - Custom options for the Blockly editor. Ffau will apply some default options if this is not specified.
     * @param {object} [settings] - Customisable options to be loaded into settings flyout.
     * @returns {*}
     */
    renderBlockly(frame, toolbox, settings, options) {
        // generate a random ID for the frame to avoid duplication
        frame.id = Ffau.generateID(frame, 'blockly');

        let editorOptions = {
            toolbox: toolbox
        };

        if (options) {
            editorOptions = Object.assign(editorOptions, options);
        } else {
            editorOptions = Object.assign(editorOptions, {
                zoom: {
                    controls: true,
                    wheel: true,
                    startScale: 1.0,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2
                },
                trashcan: true
            });
        }

        // inject blockly
        this.ffauWorkspace = Blockly.inject(frame.id, editorOptions);

        // add settings popout
        let callbacks = [];

        document.getElementsByClassName("blocklyScrollbarBackground")[0].style.zIndex = "249";
        document.getElementsByClassName("blocklyScrollbarHandle")[0].style.zIndex = "250";

        let popout = document.createElement("div");
        popout.appendChild(fontAwesome("cog cog-icon"));
        popout.className = "settings-button closed";

        let settingsWindow = document.createElement("div");
        settingsWindow.className = "settings-window closed";

        let settingsWindowFiller = document.createElement("div");
        settingsWindowFiller.className = "settings-window-filler closed";

        popout.addEventListener('click', () => {
            if (popout.classList.contains('closed')) {
                popout.classList.remove('closed');
                settingsWindow.classList.remove('closed');
                settingsWindowFiller.classList.remove('closed');

                popout.classList.add('opening');
                settingsWindow.classList.add('opening');
                settingsWindowFiller.classList.add('opening');

                window.setTimeout(() => {
                    popout.classList.remove('opening');
                    settingsWindow.classList.remove('opening');
                    settingsWindowFiller.classList.remove('opening');

                    popout.classList.add('open');
                    settingsWindow.classList.add('open');
                    settingsWindowFiller.classList.add('open');
                }, 120);
            } else {
                popout.classList.remove('open');
                settingsWindow.classList.remove('open');
                settingsWindowFiller.classList.remove('open');

                popout.classList.add('closing');
                settingsWindow.classList.add('closing');
                settingsWindowFiller.classList.add('closing');

                window.setTimeout(() => {
                    popout.classList.remove('closing');
                    settingsWindow.classList.remove('closing');
                    settingsWindowFiller.classList.remove('closing');

                    popout.classList.add('closed');
                    settingsWindow.classList.add('closed');
                    settingsWindowFiller.classList.add('closed');
                }, 220);
            }
        });

        settingsWindow.appendChild(settingsWindowFiller);
        settingsWindow.appendChild(popout);

        let settingsList = document.createElement("ul");
        settingsList.className = "settings-list";

        if (settings) {
            settings.forEach((setting, id) => {
                let label = document.createElement("label");
                label.setAttribute('for', "setting-" + id.toString());
                label.className = "setting-label";
                label.innerText = setting.label;

                let elem = undefined;
                switch (setting.type) {
                    case "dropdown":
                        elem = document.createElement("select");
                        elem.className = "settings-select";

                        setting.options.forEach(option => {
                            let optionElem = document.createElement("option");
                            optionElem.value = option[1];
                            optionElem.innerText = option[0];
                            elem.appendChild(optionElem);
                        });

                        elem.onchange = () => setting.callback(elem.value);
                        callbacks.push(elem.onchange);
                        break;

                    case "boolean":
                        elem = document.createElement("label");
                        elem.className = "settings-checkbox-container";

                        let input = document.createElement("input");
                        input.type = "checkbox";
                        input.className = "settings-checkbox";
                        input.checked = true;

                        let span = document.createElement("span");
                        span.className = "settings-slider";

                        elem.appendChild(input);
                        elem.appendChild(span);

                        input.onclick = () => setting.callback(input.checked);
                        callbacks.push(input.onclick);
                        break;
                }

                elem.id = "setting-" + id.toString();

                let li = document.createElement("li");
                li.appendChild(label);
                li.appendChild(elem);

                li.className = "settings-li";

                settingsList.appendChild(li);
            });
        }

        callbacks.forEach(c => c());
        settingsWindow.appendChild(settingsList);

        let workspace = document.getElementsByClassName("injectionDiv")[0];
        workspace.prepend(settingsWindow);

        // Return workspace info
        return this.ffauWorkspace;
    }

    /**
     * Render the iframe preview
     *
     * @param {HTMLElement} frame - The frame to put the preview in
     * @returns {HTMLElement} - The generated iframe
     */
    renderPreview(frame) {
        // generate a random id to avoid duplication
        frame.id = Ffau.generateID(frame, 'iframe');

        // set the innerhtml of the frame specified
        frame.innerHTML = `<iframe style="height: inherit; width: inherit;" id="${frame.id}-iframe"></iframe>`;

        // save the frame for later use
        this.iframe = document.getElementById(frame.id + '-iframe');
        return this.iframe;
    }

    /**
     * Render the code preview
     *
     * @param {object} ace - The imported ace variable from the Ace library
     * @param {HTMLElement} frame - The frame to put the editor in
     * @param {string} [aceTheme=ace/theme/textmate] - The theme to use for Ace
     * @returns {object} - The editor object (you can call functions on this to customise Ace)
     */
    renderCode(ace, frame, aceTheme) {
        // set the id to the current ID or a random one
        frame.id = Ffau.generateID(frame, 'ace');

        // init the editor by frame id
        const editor = ace.edit(frame.id);

        // set the theme
        editor.setTheme(aceTheme || "ace/theme/textmate");

        // set other ace options
        editor.session.setMode("ace/mode/html");
        editor.setReadOnly(true);
        editor.setValue("");

        // save editor for use in event listener
        this.editor = editor;
        return this.editor;
    }

    /**
     * Add the event listener for Blockly to generate a preview and code
     *
     * @param {function} customFunction - a function to execute at the end of the change event. Gets passed the scope as a parameter.
     */
    addEvent(customFunction) {
        // add listener to workspace
        this.ffauWorkspace.addChangeListener(function () {
            // generate the code using htmlGen from generator.js
            let code = htmlGen.workspaceToCode(this.ffauWorkspace);

            // if ace has been initialised (doesn't have to be)
            if (this.editor) {
                // set the ace editor value
                this.editor.setValue(code, -1 /* set the cursor to -1 to stop highlighting everything */);
            }

            // if iframe has been initialised
            if (this.iframe) {
                this.iframe.src = "data:text/html;charset=utf-8," + encodeURIComponent(code);
            }

            if (typeof customFunction === "function") {
                customFunction(this);
            }

        }.bind(this) /* bind parent scope */);
    }

    /**
     * Return HTML code in string format
     *
     * @returns {string}
     */
    generateCode() {
        // run generator
        return htmlGen.workspaceToCode(this.ffauWorkspace);
    }

    /**
     * Return the XML block code in string format
     *
     * @returns {string}
     */
    generateXML() {
        // workspace -> XML
        const dom = Blockly.Xml.workspaceToDom(this.ffauWorkspace);
        // XML -> string
        return Blockly.Xml.domToText(dom);
    }

    /**
     * Downloads a txt file containing the XML data of the project, which can be used to save it locally.
     *
     * @param {string} [fileName=ffau-export.txt] - The name of the txt file
     * @returns {string} - The XML data as a string
     */
    downloadXML(fileName) {
        /* get the xml data from blockly */
        const data = this.generateXML();

        /* js hack to create element with unsupported mime type and force a download */
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        // set the filename to fileName or the default
        element.setAttribute('download', fileName || 'ffau-export.txt');

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        return data;
    }

    /**
     * Set the Blockly workspace to a specified XML string
     *
     * @param {string} xmlString - The XML string to use
     */
    setXML(xmlString) {
        // change the text to dom
        const dom = Blockly.Xml.textToDom(xmlString);
        // clear the workspace to avoid adding code on top
        this.clearWorkspace();

        // set the dom into the workspace
        Blockly.Xml.domToWorkspace(dom, this.ffauWorkspace);
    }

    /**
     * Clears all blocks from the workspace without further confirmation
     */
    clearWorkspace() {
        this.ffauWorkspace.clear();
    }
}
