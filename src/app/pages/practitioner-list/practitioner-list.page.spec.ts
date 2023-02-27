import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {PractitionerListPage} from './practitioner-list.page';

describe('PractitionersPage', () => {
    let component: PractitionerListPage;
    let fixture: ComponentFixture<PractitionerListPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PractitionerListPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PractitionerListPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
