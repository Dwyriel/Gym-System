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
        loadChildren: () => import('./pages/exercise-list/exercises-list.module').then(m => m.ExerciseListPageModule)
    },
    {
        path: 'exercise',
        loadChildren: () => import('./pages/exercise/exercise.module').then(m => m.ExercisePageModule)
    },
    {
        path: 'exercise/:id',
        loadChildren: () => import('./pages/exercise/exercise.module').then(m => m.ExercisePageModule)
    },
    {
        path: 'create-practitioner',
        loadChildren: () => import('./pages/create-practitioner/create-practitioner.module').then(m => m.CreatePractitionerPageModule)
    },
    {
        path: 'create-practitioner/:id',
        loadChildren: () => import('./pages/create-practitioner/create-practitioner.module').then(m => m.CreatePractitionerPageModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
