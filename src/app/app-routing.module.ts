import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {RouteGuards} from "./classes/route-guards";
import {gymName} from "../environments/environment";

const routes: Routes = [
    {
        path: '',
        canActivate: [RouteGuards.startupPageGuard],
        loadChildren: () => import('./pages/startup/startup.module').then(m => m.StartupPageModule),
        title: `${gymName}`
    },
    {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
        title: `Login - ${gymName}`
    },
    {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
        title: `Home - ${gymName}`
    },
    {
        path: 'config',
        loadChildren: () => import('./pages/config/config.module').then(m => m.ConfigPageModule),
        title: `Configuração - ${gymName}`
    },
    {
        path: 'practitioner-list',
        loadChildren: () => import('./pages/practitioner-list/practitioner-list.module').then(m => m.PractitionerListPageModule),
        title: `Alunos - ${gymName}`
    },
    {
        path: 'exercise-list',
        loadChildren: () => import('./pages/exercise-list/exercise-list.module').then(m => m.ExerciseListPageModule),
        title: `Exercícios - ${gymName}`
    },
    {
        path: 'exercise-form',
        loadChildren: () => import('./pages/exercise-form/exercise-form.module').then(m => m.ExerciseFormPageModule),
        title: `Criar exercício - ${gymName}`
    },
    {
        path: 'exercise-form/:id',
        loadChildren: () => import('./pages/exercise-form/exercise-form.module').then(m => m.ExerciseFormPageModule),
        title: `Editar exercício - ${gymName}`
    },
    {
        path: 'practitioner-form',
        loadChildren: () => import('./pages/practitioner-form/practitioner-form.module').then(m => m.PractitionerFormPageModule),
        title: `Criar aluno - ${gymName}`
    },
    {
        path: 'practitioner-form/:id',
        loadChildren: () => import('./pages/practitioner-form/practitioner-form.module').then(m => m.PractitionerFormPageModule),
        title: `Editar aluno - ${gymName}`
    },
    {
        path: 'practitioner-profile',
        redirectTo: 'practitioner-list',
        title: `Perfil do aluno - ${gymName}`
    },
    {
        path: 'practitioner-profile/:id',
        loadChildren: () => import('./pages/practitioner-profile/practitioner-profile.module').then(m => m.PractitionerProfilePageModule),
        title: `Perfil do aluno - ${gymName}`
    },
    {
        path: 'practitioner-exercise',
        redirectTo: 'practitioner-list',
        title: `Exercícios do aluno - ${gymName}`
    },
    {
        path: 'practitioner-exercise/:id',
        loadChildren: () => import('./pages/practitioner-exercise/practitioner-exercise.module').then(m => m.PractitionerExercisePageModule),
        title: `Exercícios do aluno - ${gymName}`
    },
    {
        path: 'practitioner-presence',
        redirectTo: 'practitioner-list',
        title: `Registro de presenças - ${gymName}`
    },
    {
        path: 'practitioner-presence/:id',
        loadChildren: () => import('./pages/practitioner-presence/practitioner-presence.module').then(m => m.PractitionerPresencePageModule),
        title: `Registro de presenças - ${gymName}`
    },
    {
        path: 'template-list',
        loadChildren: () => import('./pages/template-list/template-list.module').then(m => m.TemplateListPageModule),
        title: `Ciclos - ${gymName}`
    },
    {
        path: 'template-form',
        loadChildren: () => import('./pages/template-form/template-form.module').then(m => m.TemplateFormPageModule),
        title: `Criar ciclo - ${gymName}`
    },
    {
        path: 'template-form/:id',
        loadChildren: () => import('./pages/template-form/template-form.module').then(m => m.TemplateFormPageModule),
        title: `Editar ciclo - ${gymName}`
    },
    {
        path: 'template-add',
        redirectTo: 'practitioner-list',
        title: `Atribuir ciclo - ${gymName}`
    },
    {
        path: 'template-add/:id',
        loadChildren: () => import('./pages/template-add/template-add.module').then(m => m.TemplateAddPageModule),
        title: `Atribuir ciclo - ${gymName}`
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
