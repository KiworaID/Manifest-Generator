// Fungsi untuk generate UUID v4
function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Fungsi untuk generate manifest
function generateManifest(name, description, version, type, minEngineVersion, moduleData, moduleScript, scriptEntry) {
    const engineVersion = minEngineVersion.split('.').map(Number);
    const versionArray = version.split('.').map(Number);
    
    const manifest = {
        format_version: 2,
        header: {
            name: name,
            description: description,
            uuid: generateUUIDv4(),
            min_engine_version: engineVersion,
            version: versionArray
        },
        modules: [],
        dependencies: []
    };

    // Menambahkan module data jika dipilih
    if (moduleData) {
        manifest.modules.push({
            type: "data",
            uuid: generateUUIDv4(),
            version: versionArray
        });
    }

    // Menambahkan module script jika dipilih
    if (moduleScript && scriptEntry) {
        manifest.modules.push({
            type: "script",
            language: "javascript",
            uuid: generateUUIDv4(),
            entry: scriptEntry,
            version: versionArray
        });
    }

    if (type === 'behavior') {
        // Menambahkan dependencies untuk behavior pack
        manifest.dependencies = [
            {
                module_name: "@minecraft/server",
                version: "1.17.0-beta"
            },
            {
                module_name: "@minecraft/server-ui",
                version: "1.3.0"
            }
        ];
    }

    return JSON.stringify(manifest, null, 4);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('manifestForm');
    const packTypeSelect = document.getElementById('packType');
    const behaviorOptions = document.getElementById('behaviorOptions');
    const moduleScriptCheck = document.getElementById('moduleScript');
    const scriptOptions = document.getElementById('scriptOptions');
    const outputContainer = document.getElementById('outputContainer');
    const copyButton = document.getElementById('copyButton');

    // Script module checkbox handler
    moduleScriptCheck.addEventListener('change', function() {
        if (this.checked) {
            scriptOptions.classList.remove('d-none');
            document.getElementById('scriptEntry').required = true;
        } else {
            scriptOptions.classList.add('d-none');
            document.getElementById('scriptEntry').required = false;
        }
    });

    // Form validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const name = document.getElementById('packName').value;
        const description = document.getElementById('description').value;
        const version = document.getElementById('version').value;
        const type = packTypeSelect.value;
        const minEngineVersion = document.getElementById('minEngineVersion').value;
        const moduleData = document.getElementById('moduleData').checked;
        const moduleScript = document.getElementById('moduleScript').checked;
        const scriptEntry = document.getElementById('scriptEntry').value;
        
        const manifest = generateManifest(
            name, 
            description, 
            version, 
            type, 
            minEngineVersion,
            moduleData,
            moduleScript,
            scriptEntry
        );
        document.getElementById('manifestOutput').textContent = manifest;
        outputContainer.style.display = 'block';
    });

    // Reset form
    form.addEventListener('reset', function() {
        form.classList.remove('was-validated');
        outputContainer.style.display = 'none';
        behaviorOptions.classList.add('d-none');
        scriptOptions.classList.add('d-none');
        document.getElementById('moduleData').checked = true;
        document.getElementById('moduleScript').checked = false;
        document.getElementById('scriptEntry').required = false;
    });

    // Pack type change handler
    packTypeSelect.addEventListener('change', function() {
        if (this.value === 'behavior') {
            behaviorOptions.classList.remove('d-none');
        } else {
            behaviorOptions.classList.add('d-none');
            moduleScriptCheck.checked = false;
            scriptOptions.classList.add('d-none');
        }
    });

    // Copy button handler
    copyButton.addEventListener('click', function() {
        const manifestOutput = document.getElementById('manifestOutput');
        navigator.clipboard.writeText(manifestOutput.textContent)
            .then(() => {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="bi bi-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });

    // Version input validation
    const versionInput = document.getElementById('version');
    versionInput.addEventListener('input', function() {
        const isValid = /^\d+\.\d+\.\d+$/.test(this.value);
        if (isValid) {
            this.setCustomValidity('');
        } else {
            this.setCustomValidity('Versi harus dalam format x.x.x');
        }
    });
}); 