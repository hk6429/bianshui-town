import {handleCloudRequest} from '../../server/cloud-api.js';
export const onRequest=({request,env})=>handleCloudRequest(request,env);
