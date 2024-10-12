import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToolsService } from 'src/app/services/tools.service';
import { ArchivosService } from 'src/app/servicesComponents/archivos.service';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { ConfiguracionAction } from 'src/app/redux/app.actions';
import * as _ from 'lodash';
import { ConfiguracionService } from 'src/app/servicesComponents/configuracion.service';

const URLFRON = environment.urlFront;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  data:any = {};
  files: File[] = [];
  list_files: any = [];
  disableRestaure:boolean = false;

  constructor(
    private _tools: ToolsService,
    private _archivos: ArchivosService,
    private _store: Store<STORAGES>,
    private _configuracion: ConfiguracionService
  ) { 

    this._store.subscribe((store: any) => {
      console.log(store);
      store = store.name;
      this.data = store.configuracion || {};
    });

  }

  ngOnInit(): void {
  }

  onSelect(event:any, opt) {
    //console.log(event, this.files);
    if(!opt) this.files = [event.addedFiles[0]]
    else this.files = event.addedFiles;
  }
  
  onRemove(event) {
    //console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  async subirFile(opt:string){

    for(let row of this.files){
      return new Promise( resolve =>{
        let form:any = new FormData();
        form.append('file', row);
        this._tools.ProcessTime({});
        this._archivos.create(form).subscribe((res:any)=>{
          console.log(res);
          if( opt == 'foto1' || opt == 'foto2') { if(!this.data[opt]) this.data[opt] = []; this.data[opt].push( { foto: res.files }); }
          else this.data[opt] = res.files; //URL+`/${res}`;
          this._tools.presentToast("Exitoso");
          resolve( true );
        },(error)=>{console.error(error); this._tools.presentToast("Error de servidor"); resolve( false); });
      });
    }
    this.files = [];

  }

  Actualizar(){
    this.data = _.omit(this.data, ['createdAt', 'updatedAt']);
    this.data = _.omitBy( this.data, _.isNull);
    this._configuracion.update(this.data).subscribe((res:any)=>{
      console.log(res);
      this._tools.presentToast("Actualizado");
      let accion = new ConfiguracionAction(res, 'put');
      this._store.dispatch(accion);
    },(error)=>{console.error(error); this._tools.presentToast("Error de Servidor")})
  }


}
