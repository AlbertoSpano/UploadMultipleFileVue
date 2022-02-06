/* 
properties: 
    webService:  httphandler upload file
    maxMBlength: maximum file length (MB)
    extensions:  comma separated list of allowed file extensions (same rule of 'accept' attribuite)
    multiple:    boolean, single or multiple file upload

events:
    uploadstarting():                                        trigged before open window dialog for file select
    uploadstarted(count):                                    trigged after start upload
    uploadcomplete(count):                                   trigged when all file upload is complete
    uploadcompletesinglefile(index,count, filename):         trigged when single file upload is complete
    uploaderror(filename, err):                              trigged when error

methods:
    uploadOpenSelectFile(uploadParams), call from the parent to start files upload with optional parameters

usage in the parent component:

    <uploadfilecontrol ref="upload" 
                       web-service="string value" 
                       max-mb-length="numeric value" 
                       extensions="ext1,ext2,ext3,...." where all values must start with dot character (same rule for 'accept' attribute)
                       @uploadcomplete="method name of parent control"
                       @uploadstarting="method name of parent control"
                       @uploadcomplete="method name of parent control"
                       />

    <a href="#" @click="startUpload">Load file</a>

    methods:{
        startUpload() {

            // some opional custom code
            // ...
            ///...

            this.$refs.upload.uploadOpenSelectFile(this.params);
        },
    }

*/

const uploadfilecontrol = {

    template:
        `
        <input type="file" id="upload-file" :multiple="multiple" :accept="extensions" style="display: none;" />
        `,

    props: {
        webService: { type: String, required: true },
        maxMBlength: { type: Number, requires: false, default: 100 },
        extensions: { type: String, required: false },
        multiple: { type: Boolean, required: true, default: true},
    },

    data() {
        return {
            optionalParameters: {},
        }
    },

    computed: {
        // transform MB to byte
        maxlength() { return this.maxMBlength ? this.maxMBlength * 1024000 : 4096000; },
    },

    mounted() {
    },

    methods: {

        // function to call from parent
        uploadOpenSelectFile: function (params) {

            this.optionalParameters = params;

            this.$emit('uploadstarting');

            // upload via input
            document.getElementById("upload-file").value = '';
            document.getElementById("upload-file").click();
            document.getElementById("upload-file").addEventListener("change", this.start_upload);

        },

        start_upload: function (e) {

            let files = this.validate(e);

            if (!files) return

            e.preventDefault();
            e.stopPropagation();

            let that = this;
            let count = files.length;
            let formData = this.createFormData();

            // ajax dati per l'upload
            let ajaxData = [];
            for (i = 0; i < count; i++) {
                let f = files[i];
                let d = this.cloneFormData(formData);
                d.append(f.name, f);
                d.append('index', i);
                d.append('count', count);
                ajaxData.push(d);
            }

            this.$emit('uploadstarted', count);

            that.multipleUpload(ajaxData).then(function () {
                that.$emit('uploadcomplete', count);
            }).catch(ex => {
                that.$emit('uploaderror', that.getFileName(ajaxData), ex);
            });

        },

        uploadFile: function (ajaxData) {

            let url = this.webService;
            let index = parseInt(ajaxData.get('index')) + 1;
            let count = ajaxData.get('count');
            let filename = this.getFileName(ajaxData);
            let that = this;

            return function () {

                return new Promise(function (resolve, reject) {

                    var xmlhttp = new XMLHttpRequest();

                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState === 4) {
                            that.$emit('uploadcompletesinglefile', index, count, filename);
                            resolve();
                        } else if (xmlhttp.status >= 400) {
                            reject(new Error(xmlhttp.statusText));
                        } else if (xmlhttp.status <= 200) {
                            // ok
                        }
                        else {
                            reject(new Error(xmlhttp.statusText));
                        }
                    }

                    xmlhttp.open('POST', url, true);
                    xmlhttp.send(ajaxData);

                });

            }
        },

        validate(e) {

            if (!e.target) return null;

            let files = e.target.files;

            if (!files || files.length === 0) return null;

            for (var file of files){

                let extension = file.name.split('.').pop().toLowerCase();

                // validate file size
                if (file.size > this.maxlength) {
                    alert('File size larger than ' + this.maxMBlength + 'MB!');
                    return null;
                }

                // validate extension file
                if (this.extensions.length > 0 && !this.extensions.includes(extension)) {
                    alert('Only files with extensions ' + this.extensions + ' are allowed!');
                    return null;
                }

            }

            return files;

        },

        createFormData() {

            let d = new FormData();

            if (this.optionalParameters) {
                for (var key of Object.keys(this.optionalParameters)) {
                    d.append(key, this.optionalParameters[key]);
                }
            }

            return d;

        },

        cloneFormData(formData) {
            let result = new FormData();
            if (!formData) return result;
            for (var key of formData.keys()) {
                result.append(key,formData.get(key));
            }
            return result;
        },

        getFileName(formData) {
            for ([key, value] of formData.entries()) {
                let val;
                if (value instanceof File) {
                    return value.name;
                } 
            }
            return '****';
        },

        multipleUpload: function (ajaxData) {
            var tasks = ajaxData.map(this.uploadFile);
            var p = tasks[0](); // start off the chain
            for (var i = 1; i < tasks.length; i++) {              
                p = p.then(tasks[i]); // the chain continues
            }
            return p;
        },

    }
}

