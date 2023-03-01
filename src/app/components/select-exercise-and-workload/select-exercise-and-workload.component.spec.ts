import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SelectExerciseAndWorkloadComponent} from './select-exercise-and-workload.component';

describe('SelectExerciseAndWorkloadComponent', () => {
    let component: SelectExerciseAndWorkloadComponent;
    let fixture: ComponentFixture<SelectExerciseAndWorkloadComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SelectExerciseAndWorkloadComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SelectExerciseAndWorkloadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
