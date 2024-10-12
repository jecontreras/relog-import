import { Component, OnDestroy, ChangeDetectorRef, OnInit, VERSION, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../../../components/login/login.component';
import { RegistroComponent } from '../../../components/registro/registro.component';
import { ServiciosService } from 'src/app/services/servicios.service';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { CartAction, UserAction } from 'src/app/redux/app.actions';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { ToolsService } from 'src/app/services/tools.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { NotificacionesService } from 'src/app/servicesComponents/notificaciones.service';
import { FormventasComponent } from 'src/app/dashboard-config/form/formventas/formventas.component';

const URLFRON = environment.urlFront;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  showFiller = false;
  public mobileQuery: any;
  breakpoint: number;
  private _mobileQueryListener: () => void;
  menus:any = [];
  menus2:any = [];
  dataUser:any = {};
  rolUser:any = {};
  data:any = {
    total: 0
  };
  listCart: any = [];

  shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));
  events: string[] = [];
  urlwhat:string;
  userId:any;
  opened:boolean;
  dataInfo:any = {};
  isHandset$:any;
  urlRegistro:string = `${ URLFRON }/registro/`;
  notificando:number = 0;
  opcionoView:string = 'carro';
  listNotificaciones:any =[];
  tiendaInfo:any = {};
  
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher, private router: Router,
    public dialog: MatDialog,
    private _store: Store<CART>,
    private _user: UsuariosService,
    private _tools: ToolsService,
    private _notificaciones: NotificacionesService,
    private _venta: VentasService,

  ) { 
    this._store.subscribe((store: any) => {
      //console.log(store);
      store = store.name;
      if(!store) return false;
      this.listCart = store.cart || [];
      this.userId = store.usercabeza || {};
      this.dataUser = store.user || {};
      this.tiendaInfo = store.configuracion || {};
      this.submitChat();
    });
    //this.getVentas();
    this.mobileQuery = media.matchMedia('(max-width: 290px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    // tslint:disable-next-line:no-unused-expression
    this.mobileQuery.ds;

  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    this.onResize(null);
    if(Object.keys(this.dataUser).length > 0 ) {
      this.rolUser = this.dataUser.usu_perfil.prf_descripcion;
      this.urlRegistro+=this.dataUser.id;
      this.getInfoUser();
    }
    else this.rolUser = 'visitante';
    this.listMenus();
    if(this.rolUser === 'administrador') this.getCarrito();
  }

  getVentas(){
    //console.log("***")
    let data:any = { where:{ view:0 },limit: 100 }
    //if(this.dataUser.usu_perfil.prf_descripcion != 'administrador') data.where.user=this.dataUser.id,
    this._notificaciones.get( data ).subscribe((res:any)=>{
      //console.log(res);
      if(res.data.length > this.notificando) this.audioNotificando('./assets/sonidos/notificando.mp3');
      this.notificando = res.data.length;
      this.listNotificaciones = res.data;
    },(error)=>this._tools.presentToast("error de servidor"));
  }

  audioNotificando(obj:string){
    let sonido = new Audio();
    sonido.src = './assets/sonidos/notificando.mp3';
    sonido.load();
    sonido.play();
  }

  getCarrito(){
    setInterval(()=>{ 
      this.getVentas();
    }, 5000);
  }

  clickNotificando( obj:any ){
    console.log(obj);
    this.estadoNotificaciones(obj);
    if(obj.venta){
      this._venta.get({ where:{ id: obj.venta } }).subscribe((res:any)=>{
        res = res.data[0];
        if(!res) return this._tools.presentToast("No se encontro la venta!");
        const dialogRef = this.dialog.open(FormventasComponent,{
          data: {datos: res }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });
      });
    }
  }

  estadoNotificaciones(obj:any){
    let data:any ={
      id: obj.id,
      view: 1
    };
    this._notificaciones.update(data).subscribe((res:any)=>{});
  }

  deleteCart(idx:any, item:any){
    this.listCart.splice(idx, 1);
    let accion = new CartAction(item, 'delete');
    this._store.dispatch(accion);
  }

  submitChat(){
    let texto:string;
    this.data.total = 0;
    for(let row of this.listCart){
      texto+= ` productos: ${ row.titulo } codigo: ${ row.codigo } foto: ${ row.foto } cantidad: ${ row.cantidad } color ${ row.color || 'default'}`;
      this.data.total+= row.costoTotal || 0;
    }
    if(this.dataUser.id){
        this.urlwhat = `https://wa.me/${ this.dataUser.usu_indicativo || 57 }${ this.dataUser.usu_telefono || ( this.tiendaInfo.numeroCelular || 3208429429 ) }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
    }else{
      if(this.userId.id) this.urlwhat = `https://wa.me/${ this.userId.usu_indicativo || 57 }${ this.userId.usu_telefono || ( this.tiendaInfo.numeroCelular || 3208429429 ) }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
      else this.urlwhat = `https://wa.me/57${ this.tiendaInfo.numeroCelular }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  getInfoUser(){
    this._user.getInfo({where:{id:this.dataUser.id}}).subscribe((res:any)=>this.dataInfo = res.data);
  }

  onResize(event:any) {
    // console.log("hey", event);
    if (event) {
      this.breakpoint = (event.target.innerWidth <= 700) ? 1 : 6;
    }
    // console.log(this.breakpoint);
    if (this.breakpoint === 1) {
      this.mobileQuery.ds = true;
    } else {
      // console.log(this.mobileQuery);
      this.mobileQuery.ds = false;
    }
  }

  EventMenus(obj:any){
    console.log(obj);
    if(obj.url == 'login()') this.login();
    if(obj.url == 'registrar()') this.registrar();
    if(obj.url == 'salir()') this.salir();
  }

  btnCarrito(){

  }
  
  listMenus(){
    this.menus = [
      {
        icons: 'home',
        nombre: 'Inicio',
        disable: true,
        url: '.',
        submenus:[]
      },
      {
        icons: 'storefront',
        nombre: 'Tienda',
        disable: true,
        url: '/tienda',
        submenus:[]
      },
      // {
      //   icons: 'menu_book',
      //   nombre: 'Productos',
      //   disable: true,
      //   url: '/config/pedidos',
      //   submenus:[]
      // },
      {
        icons: 'account_circle',
        nombre: 'Mi Cuenta',
        disable: this.rolUser !== 'visitante',
        url: '/config/perfil',
        submenus:[]
      },
      /*{
        icons: 'shop',
        nombre: 'Mis Bancos',
        url: '/config/bancos',
        submenus:[]
      },*/
      {
        icons: 'shop',
        nombre: 'Mis Cobros',
        disable: this.rolUser !== 'visitante',
        url: '/config/cobros',
        submenus:[]
      },
      {
        icons: 'local_grocery_store',
        nombre: 'Mis Ventas',
        disable: this.rolUser !== 'visitante',
        url: '/config/ventas',
        submenus:[]
      },
      {
        icons: 'people_alt',
        nombre: 'Mis Referidos',
        disable: this.rolUser !== 'visitante',
        url: '/config/referidos',
        submenus:[]
      },
      /*{
        icons: 'security',
        nombre: 'Seguridad',
        url: '.',
        submenus:[]
      },*/
      // {
      //   icons: 'settings',
      //   nombre: 'Configuración',
      //   disable: this.rolUser == 'administrador',
      //   url: '.',
      //   submenus:[]
      // },
      {
        icons: 'settings',
        nombre: 'Categorias',
        url: '/config/categorias',
        disable: this.rolUser == 'administrador',
        submenus:[]
      },
      {
        icons: 'settings',
        nombre: 'Productos',
        url: '/config/productos',
        disable: this.rolUser == 'administrador',
        submenus:[]
      },
      {
        icons: 'settings',
        nombre: 'Testimonios',
        url: '/config/testimonios',
        disable: this.rolUser == 'administrador',
        submenus:[]
      },
      {
        icons: 'settings',
        nombre: 'Usuarios',
        url: '/config/usuarios',
        disable: this.rolUser == 'administrador',
        submenus:[]
      },
      {
        icons: 'settings',
        nombre: 'Configuraciones',
        url: '/config/configuracion',
        disable: this.rolUser == 'administrador',
        submenus:[]
      }
      /*{
        icons: 'assessment',
        nombre: 'Informes',
        url: '.',
        submenus:[]
      },*/
    ];
    
    this.menus = _.filter(this.menus, row=>row.disable);
    
    this.menus2 = [
      {
        icons: 'account_circle',
        nombre: 'Iniciar Sección',
        disable: this.rolUser === 'visitante',
        url: 'login()',
        submenus:[]
      },
      {
        icons: 'supervisor_account',
        nombre: 'Vende para nosotros',
        disable: this.rolUser === 'visitante',
        url: 'registrar()',
        submenus:[]
      },
      {
        icons: 'exit_to_app',
        nombre: 'Salir',
        disable: this.dataUser.id,
        url: 'salir()',
        submenus:[]
      },

    ];
    this.menus2 = _.filter(this.menus2, row=>row.disable);
  }

  copiarLinkRegistro(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.urlRegistro;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._tools.openSnack('Copiado:' + ' ' + this.urlRegistro, 'completado', false);
  }

  login(){
    const dialogRef = this.dialog.open(LoginComponent,{
      width: '461px',
      data: { datos: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  registrar(){
    const dialogRef = this.dialog.open(RegistroComponent,{
      width: '461px',
      data: { datos: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  salir(){
    localStorage.removeItem('user');
    let accion = new UserAction( this.dataUser, 'delete');
    this._store.dispatch(accion);
    location.reload();
  }

}
