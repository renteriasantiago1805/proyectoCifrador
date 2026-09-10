import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cifrador } from './cifrador';

describe('Cifrador', () => {
  let component: Cifrador;
  let fixture: ComponentFixture<Cifrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cifrador],
    }).compileComponents();

    fixture = TestBed.createComponent(Cifrador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
