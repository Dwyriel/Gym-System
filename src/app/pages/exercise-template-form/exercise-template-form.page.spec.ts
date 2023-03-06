import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ExerciseTemplateFormPage} from './exercise-template-form.page';

describe('ExerciseTemplateFormPage', () => {
    let component: ExerciseTemplateFormPage;
    let fixture: ComponentFixture<ExerciseTemplateFormPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ExerciseTemplateFormPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ExerciseTemplateFormPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
