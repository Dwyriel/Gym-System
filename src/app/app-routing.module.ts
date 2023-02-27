import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/startup/startup.module').then(m => m.StartupPageModule)
    },
    {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
    },
    {
        path: 'config',
        loadChildren: () => import('./pages/config/config.module').then(m => m.ConfigPageModule)
    },
    {
        path: 'practitioner-list',
        loadChildren: () => import('./pages/practitioner-list/practitioner-list.module').then(m => m.PractitionerListPageModule)
    },
    {
        path: 'exercise-list',
        loadChildren: () => import('./pages/exercise-list/exercise-list.module').then(m => m.ExerciseListPageModule)
    },
    {
        path: 'exercise-form',
        loadChildren: () => import('./pages/exercise-form/exercise-form.module').then(m => m.ExerciseFormPageModule)
    },
    {
        path: 'exercise-form/:id',
        loadChildren: () => import('./pages/exercise-form/exercise-form.module').then(m => m.ExerciseFormPageModule)
    },
    {
        path: 'practitioner-form',
        loadChildren: () => import('./pages/practitioner-form/practitioner-form.module').then(m => m.PractitionerFormPageModule)
    },
    {
        path: 'practitioner-form/:id',
        loadChildren: () => import('./pages/practitioner-form/practitioner-form.module').then(m => m.PractitionerFormPageModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
