# Vue component: Upload Multiple File

**properties**: 

    webService:  server-side httphandler upload file       
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
    
    
method in the parent code

    methods:{
    
        startUpload() {
        
            // some opional custom code
            
            // ...
            
            ///...
            
            this.$refs.upload.uploadOpenSelectFile(this.params);
            
        },
        
    }
    
