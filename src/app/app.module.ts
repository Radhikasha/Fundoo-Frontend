import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { NoteCreateComponent } from './components/notes/note-create/note-create.component';
import { NoteCardComponent } from './components/notes/note-card/note-card.component';
import { NoteEditModalComponent } from './components/notes/note-edit-modal/note-edit-modal.component';
import { EditLabelsModalComponent } from './components/labels/edit-labels-modal/edit-labels-modal.component';
import { LabelPopoverComponent } from './components/labels/label-popover/label-popover.component';
import { ColorPickerComponent } from './components/shared/color-picker/color-picker.component';
import { CollaboratorModalComponent } from './components/shared/collaborator-modal/collaborator-modal.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { ReminderPickerComponent } from './components/shared/reminder-picker/reminder-picker.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    DashboardComponent,
    NavbarComponent,
    SidebarComponent,
    NoteCreateComponent,
    NoteCardComponent,
    NoteEditModalComponent,
    EditLabelsModalComponent,
    LabelPopoverComponent,
    ColorPickerComponent,
    CollaboratorModalComponent,
    ToastComponent,
    ReminderPickerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
