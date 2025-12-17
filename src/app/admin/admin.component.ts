import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin',
  imports: [HttpClientModule, CommonModule, FormsModule, DragDropModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  filterDate: string = '';
  searchTerm: string = '';
  selectedPatientIds = new Set<number>();

  // activeCount = 0;
  // completedCount = 0;
  // onHoldCount = 0;
  get activeCount(): number {
    return this.filteredPatients.filter((p) => p.activated).length;
  }

  get completedCount(): number {
    return this.filteredPatients.filter((p) => p.done).length;
  }

  get onHoldCount(): number {
    return this.filteredPatients.filter((p) => p.onHold).length;
  }

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http
      .get<any[]>('https://venkatesha-backend.onrender.com/api/patients')
      .subscribe({
        next: (data) => {
          console.log('Raw data:', data);
          // this.patients = data.map((p) => ({
          //   ...p,
          //   activated: false,
          //   onHold: false,
          //   done: false,
          // }));
          this.patients = data;
          this.filteredPatients = [...this.patients]; // add this line
          if (!this.filterDate) {
            console.log('✅ ngOnInit → reset-order');

            this.http
              .put(
                'https://venkatesha-backend.onrender.com/api/admin/patients/reset-order',
                {}
              )
              .subscribe(() => {
                console.log('✅ DB order_index set to NULL (on refresh)');
              });
          }
        },
        error: (error) => {
          console.error('Failed to fetch patients:', error);
        },
      });
  }
  onSearch(date?: string): void {
    const term = this.searchTerm.toLowerCase();
    // let selectedDate: string='false';
    let selectedDate = this.filterDate;
    console.log(selectedDate);
    if (!selectedDate) {
      console.log('reset-order');
      this.filteredPatients = this.patients.filter(
        (p) =>
          !term ||
          p.name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.phone?.includes(term)
      );

      // Tell backend → reset all order_index
      this.http
        .put(
          'https://venkatesha-backend.onrender.com/api/admin/patients/reset-order',
          {}
        )
        .subscribe(() => {
          console.log('✅ DB order_index set to NULL');
        });
      console.log('reset-order');
      return;
    } else {
      // Convert DD-MM-YYYY → YYYY-MM-DD if needed
      if (selectedDate.includes('-')) {
        const parts = selectedDate.split('-');
        if (parts[0].length === 2) {
          selectedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      this.filteredPatients = this.patients.filter((patient) => {
        console.log('APT DATE:', patient.aptAt);

        const patientDate = patient.aptAt
          ? new Date(patient.aptAt).toISOString().split('T')[0]
          : '';

        let status = patient.activated
          ? 'active'
          : patient.onHold
          ? 'on hold'
          : patient.done
          ? 'completed'
          : 'in queue';

        return (
          patientDate === selectedDate &&
          (!term ||
            patient.name?.toLowerCase().includes(term) ||
            patient.email?.toLowerCase().includes(term) ||
            patient.phone?.includes(term) ||
            status.includes(term))
        );
      });
      this.filteredPatients.sort(
        (a, b) => (a.orderIndex ?? a.id) - (b.orderIndex ?? b.id)
      );
      this.http
        .put(
          `https://venkatesha-backend.onrender.com/api/admin/patients/init-order/${selectedDate}`,
          {}
        )
        .subscribe(() => console.log('✅ init-order called'));
    }
    // this.updateStatusCounts();
  }

  // activatePatient(patient: any) {
  //   patient.activated = true;
  //   patient.onHold = false;
  //   patient.done=false; // remove hold if any
  //   // Optional: push update to backend:
  //   // this.http.post('/api/patients/activate', { id: patient.id }).subscribe();
  // }

  holdPatient(patient: any) {
    patient.onHold = true;
    patient.activated = false;
    patient.done = false;
    // Optional: post hold status to backend
    this.saveStatus(patient);
    // this.updateStatusCounts();
  }

  toggleActivate(patient: any) {
    patient.activated = !patient.activated;
    if (patient.activated) patient.onHold = false;
    this.saveStatus(patient);
    // this.updateStatusCounts();
  }

  // patientDone(patient: any) {
  //   patient.activated = false;
  //   patient.done = true;
  //   patient.onHold = false;
  //   console.log('patient done called');
  // }

  handleButtonClick(patient: any) {
    if (patient.activated) {
      this.patientDone(patient);
    } else if (!patient.activated) {
      this.activatePatient(patient);
    }
  }

  activatePatient(patient: any) {
    patient.activated = true;
    patient.onHold = false;
    patient.done = false; // remove hold if any
    // Optional: push update to backend:
    // this.http.post('/api/patients/activate', { id: patient.id }).subscribe();
    this.saveStatus(patient);
    // this.updateStatusCounts();
  }

  patientDone(patient: any) {
    patient.activated = false;
    patient.done = true;
    patient.onHold = false;
    console.log('patient done called');
    this.saveStatus(patient);
    // this.updateStatusCounts();
  }

  dropRow(event: CdkDragDrop<any[]>) {
    let selectedDate = this.filterDate;
    if (!this.filterDate) return;

    moveItemInArray(
      this.filteredPatients,
      event.previousIndex,
      event.currentIndex
    );

    // Update local order_index
    this.filteredPatients.forEach((p, index) => {
      p.orderIndex = index + 1;
    });

    // Persist order
    this.http
      .put(
        `https://venkatesha-backend.onrender.com/api/admin/patients/init-order/${selectedDate}`,
        this.filteredPatients
      )
      .subscribe(() => console.log('Order saved'));
  }
  saveStatus(patient: any) {
    this.http
      .put(
        `https://venkatesha-backend.onrender.com/api/admin/patients/${patient.id}/status`,
        patient
      )
      .subscribe(() => {
        console.log('Status saved');
      });
  }
  onDateChange(value: string) {
    this.filterDate = value ?? '';
    this.onSearch(this.filterDate);
  }
  togglePatientSelection(patientId: number, event: any) {
    if (event.target.checked) {
      this.selectedPatientIds.add(patientId);
    } else {
      this.selectedPatientIds.delete(patientId);
    }
  }
  deleteSelectedPatients() {
    if (this.selectedPatientIds.size === 0) {
      alert('Please select at least one patient');
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete ${this.selectedPatientIds.size} patient(s)?`
    );
    if (!confirmDelete) return;

    const ids = Array.from(this.selectedPatientIds);

    this.http
      .request(
        'delete',
        'https://venkatesha-backend.onrender.com/api/admin/patients/bulk-delete',
        {
          body: ids,
        }
      )
      .subscribe({
        next: () => {
          // remove from patients
          this.patients = this.patients.filter(
            (p) => !this.selectedPatientIds.has(p.id)
          );

          // remove from filteredPatients
          this.filteredPatients = this.filteredPatients.filter(
            (p) => !this.selectedPatientIds.has(p.id)
          );

          // clear selection
          this.selectedPatientIds.clear();

          // update counts
          // this.updateCounts();
          // get activeCount();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete patients');
        },
      });
  }

  // updateStatusCounts() {
  //   this.activeCount = this.filteredPatients.filter((p) => p.activated).length;

  //   this.completedCount = this.filteredPatients.filter((p) => p.done).length;

  //   this.onHoldCount = this.filteredPatients.filter((p) => p.onHold).length;
  // }
}
