import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {TemplateFormPage} from './template-form-page.component';

describe('ExerciseTemplateFormPage', () => {
    let component: TemplateFormPage;
    let fixture: ComponentFixture<TemplateFormPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TemplateFormPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TemplateFormPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
