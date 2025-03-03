import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Employee {
  id: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  gender: string;
  hobbies: string[];
  designation: string;
}

@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css'],
})
export class CrudComponent {
  employeeForm: FormGroup;
  employees: Employee[] = [];
  editIndex: number | null = null;
  designations = ['Developer', 'Designer', 'Manager', 'HR'];
  selectedHobbies: string[] = [];

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      hobbies: [],
      designation: ['', Validators.required],
    });

    this.loadFromLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem('employees', JSON.stringify(this.employees));
  }

  loadFromLocalStorage() {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      this.employees = JSON.parse(storedEmployees);
    }
  }

  onSubmit() {
    if (this.employeeForm.invalid) return;

    const formValue = { ...this.employeeForm.value, hobbies: this.selectedHobbies };

    if (this.editIndex !== null) {
      this.employees[this.editIndex] = formValue;
      this.editIndex = null;
    } else {
      this.employees.push({ id: this.employees.length + 1, ...formValue });
    }

    this.saveToLocalStorage();

    // Reset the form
    this.employeeForm.reset();
    this.selectedHobbies = [];

    // Ensure checkboxes, radio buttons, and dropdown reset
    this.employeeForm.patchValue({ gender: '', designation: '', hobbies: [] });

    // Explicitly uncheck checkboxes in UI
    document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
  }



  onEdit(index: number) {
    this.editIndex = index;
    const employee = this.employees[index];
    this.selectedHobbies = employee.hobbies;
    this.employeeForm.patchValue(employee);
  }

  onDelete(index: number) {
    const isDelete = confirm('Are you sure you want to delete?');
    if (!isDelete) return;
    this.employees.splice(index, 1);
    this.saveToLocalStorage();
  }

  onHobbyChange(event: any, hobby: string) {
    if (event.target.checked) {
      this.selectedHobbies.push(hobby);
    } else {
      this.selectedHobbies = this.selectedHobbies.filter((h) => h !== hobby);
    }
  }

  getErrorMessage(field: string) {
    const control = this.employeeForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength')) return 'Minimum 3 characters required';
    if (control?.hasError('email')) return 'Invalid email format';
    if (control?.hasError('pattern')) return 'Invalid format';
    return '';
  }
}
