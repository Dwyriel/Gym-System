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
        loadChildren: () => import('./pages/config/config.module').then( m => m.ConfigPageModule)
    },
  {
    path: 'practitioners',
    loadChildren: () => import('./pages/practitioners/practitioners.module').then( m => m.PractitionersPageModule)
  },
  {
    path: 'exercises',
    loadChildren: () => import('./pages/exercises/exercises.module').then( m => m.ExercisesPageModule)
  },
  {
    path: 'create-exercise',
    loadChildren: () => import('./pages/create-exercise/create-exercise.module').then( m => m.CreateExercisePageModule)
  },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
