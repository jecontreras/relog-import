import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductoViewComponent } from './components/producto-view/producto-view.component';
import { LoginsComponent } from './layout/login/login.component';
import { RegistrosComponent } from './layout/registro/registro.component';
import { PedidosComponent } from './dashboard-config/components/pedidos/pedidos.component';
import { ProductosComponent } from './tienda/productos/productos.component';


const routes: Routes = [
  { path: '', redirectTo: 'tienda', pathMatch: 'full' },
  { path: 'pedidos/:id', component: PedidosComponent },
  { path: 'productos/:id', component: ProductoViewComponent },
  { path: 'login', component: LoginsComponent },
  { path: 'registro', component: RegistrosComponent },
  { path: 'registro/:id', component: RegistrosComponent },
  {
    path: 'config', 
    children: [{
      path: '',
      loadChildren: () => import('./dashboard-config/config.module').then(m => m.ConfigModule)
    }]
  },
  {
    path: 'tienda', 
    children: [{
      path: '',
      loadChildren: () => import('./tienda/tienda.module').then(m => m.TiendaModule)
    }]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
