import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AdminComponent } from './admin/admin.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {path:'home',component:HomeComponent},
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'about',component:AboutComponent},
    {path:'appointments',component:AppointmentsComponent},
    {path:'admin-under-dev-phase-e',component:AdminComponent, canActivate:[adminGuard]}
];
