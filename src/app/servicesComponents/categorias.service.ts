import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('tblcategorias/querys',query, 'post');
  }
  getProduct(query:any){
    return this._model.querys('tblcategorias/querysProduct',query, 'post');
  }
  create(query:any){
    return this._model.querys('tblcategorias',query, 'post');
  }
  update(query:any){
    return this._model.querys('tblcategorias/'+query.id, query, 'put');
  }
  delete(query:any){
    return this._model.querys('tblcategorias/'+query.id, query, 'delete');
  }
}
