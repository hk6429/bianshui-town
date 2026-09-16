// Keep a validated, detached snapshot. Failed frames never replace it.
export class RecoveryPoint {
 constructor({read,validate,interval=1000}){Object.assign(this,{read,validate,interval});this.savedAt=-Infinity;this.fault=null;this.data=null;this.checkpoint(0);}
 checkpoint(now){if(this.fault||now-this.savedAt<this.interval)return;const data=this.validate(this.read());this.data=data;this.savedAt=now;}
 fail(error){if(!this.fault)this.fault=error instanceof Error?error:new Error(String(error));return this.snapshot();}
 snapshot(){return structuredClone(this.data);}
}
