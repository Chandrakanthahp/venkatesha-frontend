import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-appointments',
  imports: [NavbarComponent,ReactiveFormsModule,HttpClientModule,CommonModule,FooterComponent],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent {
  registerForm:FormGroup;
  error:any;
  success=""

  constructor(private fb: FormBuilder,private http:HttpClient,private router: Router){
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      aptAt: ['', [Validators.required]],
      birthDate: ['',[Validators.required]]
    });
  }

    

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const patientData = this.registerForm.value;
      console.log("Submitting:", patientData);
      if (
        patientData.name === 'admin@123' &&
        patientData.email === 'admin123@gmail.com' &&
        patientData.phone === '1826092200' &&
        patientData.aptAt === '2002-01-09' &&
        patientData.birthDate === '2002-01-09'
      ) {
        sessionStorage.setItem('isAdmin', 'true');
        this.router.navigate(['/admin-under-dev-phase-e']); // ✅ Route to admin
      } else {
        this.http
          .post(
            'https://venkatesha-backend.onrender.com/api/patients/register',
            patientData
          )
          .subscribe({
            next: (response) => {
              console.log('Patient registered successfully', response);
              // alert("Patient registered successfully");
              if(patientData.email!=null && patientData.email!=""){
                this.success = 'Registration Successful, check you email 🧐';
              }else{
                this.success =
                  'Registration Successful 😉';
              }
              
              this.registerForm.reset();
              // if (
              //   patientData.name === 'admin@22' &&
              //   patientData.email === 'admin22@gmail.com' &&
              //   patientData.phone === '1826092222'
              // ) {
              //   this.router.navigate(['/admin']); // ✅ Route to admin
              // }
            },
            error: (error) => {
              console.error('Registration failed', error);
              alert('Something went wrong!');
            },
          });
      } }else {
      alert("Please fill all required fields correctly.");
    }
  }
}
