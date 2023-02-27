import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ExerciseListPage} from './exercise-list.page';

describe('ExerciseList', () => {
    let component: ExerciseListPage;
    let fixture: ComponentFixture<ExerciseListPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ExerciseListPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ExerciseListPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
