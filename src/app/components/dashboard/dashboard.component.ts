import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NoteService } from '../../services/note.service';
import { LabelService } from '../../services/label.service';
import { ToastService } from '../../services/toast.service';
import { ReminderService } from '../../services/reminder.service';
import { NoteResponseDTO } from '../../models/note.model';

export interface Label {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  createdAt: string;
  updatedAt: string;
  ownerEmail: string;
  collaborators: string[];
  labels: Label[];
  reminder?: string; // ISO date string — stored in localStorage via ReminderService
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Layout & Navigation State
  sidebarExpanded = true;
  activeSection = 'notes';
  isGridView = true;
  searchQuery = '';
  userEmail = '';
  isRefreshing = false;

  // Data
  notes: Note[] = [];
  labels: Label[] = [];
  selectedLabel: Label | null = null;

  // Active Modals State
  showEditLabelsModal = false;
  showCollaboratorModal = false;
  editingNote: Note | null = null;
  editingCollaboratorsNote: Note | null = null;
  isAddingCollaborator = false;

  colors: { name: string; value: string }[] = [
    { name: 'Default', value: '#ffffff' },
    { name: 'Coral', value: '#f28b82' },
    { name: 'Peach', value: '#fbbc04' },
    { name: 'Sand', value: '#fff475' },
    { name: 'Mint', value: '#ccff90' },
    { name: 'Sage', value: '#a7ffeb' },
    { name: 'Fog', value: '#cbf0f8' },
    { name: 'Storm', value: '#aecbfa' },
    { name: 'Dusk', value: '#d7aefb' },
    { name: 'Blossom', value: '#fdcfe8' },
    { name: 'Clay', value: '#e6c9a8' },
    { name: 'Chalk', value: '#e8eaed' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private labelService: LabelService,
    private toastService: ToastService,
    private reminderService: ReminderService
  ) { }

  private pendingNoteId: number | null = null;

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }
    this.userEmail = localStorage.getItem('email') || '';
    this.loadLabels();
    this.loadNotes();

    // Start reminder polling — passes live notes getter; fires notification when due
    this.reminderService.startPolling(
      () => this.notes,
      (firedNoteId) => {
        // After notification fires, call backend to remove the reminder
        const note = this.notes.find(n => n.id === firedNoteId);
        if (note) {
          this.noteService.removeReminder(note.id).subscribe({
            next: () => { note.reminder = undefined; },
            error: (err: any) => console.error('Failed to auto-remove fired reminder:', err)
          });
        }
      }
    );

    window.addEventListener('pageshow', this.checkBfCache);
    window.addEventListener('popstate', this.checkBfCache);

    this.route.queryParams.subscribe(params => {
      if (params['noteId']) {
        this.pendingNoteId = +params['noteId'];
        this.checkQueryNoteId();
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('pageshow', this.checkBfCache);
    window.removeEventListener('popstate', this.checkBfCache);
    this.reminderService.stopPolling();
  }

  private checkBfCache = (event: Event): void => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
    }
  };

  // ══════════════ DATA LOADING ══════════════
  loadLabels(): void {
    this.labelService.getAllLabels().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.labels = res.data.map((l: any) => ({ id: l.id, name: l.name }));
        }
      },
      error: (err: any) => console.error('Failed to load labels:', err)
    });
  }

  loadNotes(): void {
    let apiCall;
    if (this.activeSection.startsWith('label_')) {
      const labelId = +this.activeSection.replace('label_', '');
      apiCall = this.labelService.getNotesByLabel(labelId);
    } else {
      switch (this.activeSection) {
        case 'archive':
          apiCall = this.noteService.getArchivedNotes();
          break;
        case 'trash':
          apiCall = this.noteService.getTrashedNotes();
          break;
        case 'reminders':
          apiCall = this.noteService.getNotesWithReminders();
          break;
        default:
          apiCall = this.noteService.getAllNotes();
          break;
      }
    }

    apiCall.subscribe({
      next: (response: any) => {
        this.notes = this.mapNotes(response.data);
        this.checkQueryNoteId();
      },
      error: (err: any) => {
        console.error('Failed to load notes:', err);
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/signin'], { queryParams: this.route.snapshot.queryParams });
        }
      }
    });
  }

  private mapNotes(data: NoteResponseDTO[]): Note[] {
    if (!data) return [];
    return data.map((n: NoteResponseDTO) => ({
      id: n.id,
      title: n.title || '',
      content: n.content || '',
      color: n.color || '#ffffff',
      pinned: n.pinned,
      archived: n.archived,
      trashed: n.trashed,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      ownerEmail: n.ownerEmail || '',
      collaborators: n.collaborators || [],
      labels: (n.labels || []).map((l: any) => ({ id: l.id, name: l.name })),
      reminder: n.reminder ?? undefined   // ← now comes directly from backend
    }));
  }

  private checkQueryNoteId(): void {
    const noteIdParam = this.pendingNoteId || (this.route.snapshot.queryParams['noteId'] ? +this.route.snapshot.queryParams['noteId'] : null);
    if (noteIdParam && this.notes && this.notes.length > 0) {
      const targetNote = this.notes.find((n: Note) => n.id === noteIdParam);
      if (targetNote) {
        this.openEditModal(targetNote);
      } else {
        this.noteService.getArchivedNotes().subscribe({
          next: (res: any) => {
            if (res.data) {
              const archivedNotes = this.mapNotes(res.data);
              const foundInArchived = archivedNotes.find((n: Note) => n.id === noteIdParam);
              if (foundInArchived) {
                this.openEditModal(foundInArchived);
              }
            }
          }
        });
      }
    }
  }

  // ══════════════ NAVIGATION & SECTION HELPERS ══════════════
  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  handleRefresh(): void {
    this.isRefreshing = true;
    this.loadNotes();
    this.loadLabels();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 450);
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.searchQuery = '';
    this.loadNotes();
  }

  selectLabelSection(label: Label): void {
    this.selectedLabel = label;
    this.setActiveSection('label_' + label.id);
  }

  toggleLayout(): void {
    this.isGridView = !this.isGridView;
  }

  signOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    this.toastService.info('Logged out successfully.');
    this.router.navigate(['/signin']);
  }

  get activeHeaderTitle(): string {
    switch (this.activeSection) {
      case 'archive': return 'Archive';
      case 'trash': return 'Trash';
      case 'reminders': return 'Reminders';
      default: return 'Fundoo';
    }
  }

  get filteredNotes(): Note[] {
    let result: Note[];
    switch (this.activeSection) {
      case 'archive':
        result = this.notes.filter(n => n.archived && !n.trashed);
        break;
      case 'trash':
        result = this.notes.filter(n => n.trashed);
        break;
      case 'reminders':
        // Backend already returns only notes with reminders for this section
        result = this.notes;
        break;
      default:
        result = this.notes.filter(n => !n.archived && !n.trashed);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return result;
  }

  get pinnedNotes(): Note[] {
    return this.filteredNotes.filter(n => n.pinned);
  }

  get unpinnedNotes(): Note[] {
    return this.filteredNotes.filter(n => !n.pinned);
  }

  get hasPinnedNotes(): boolean {
    return (
      this.activeSection === 'notes' ||
      this.activeSection.startsWith('label_') ||
      this.activeSection === 'archive' ||
      this.activeSection === 'reminders'
    ) && this.pinnedNotes.length > 0;
  }

  get reminderNotes(): Note[] {
    return this.notes.filter(n => !!n.reminder && !n.trashed);
  }

  // ══════════════ NOTE OPERATIONS ══════════════
  handleCreateNote(noteData: {
    title: string;
    content: string;
    color: string;
    pinned: boolean;
    archived: boolean;
    collaborators: string[];
    labels: Label[];
  }): void {
    const noteDTO = {
      title: noteData.title,
      content: noteData.content || ' ',
      color: noteData.color
    };

    this.noteService.createNote(noteDTO).subscribe({
      next: (response: any) => {
        const created = response.data as NoteResponseDTO;
        const note: Note = {
          id: created.id,
          title: created.title || '',
          content: created.content || '',
          color: created.color || '#ffffff',
          pinned: created.pinned,
          archived: created.archived,
          trashed: created.trashed,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          ownerEmail: created.ownerEmail || '',
          collaborators: created.collaborators || [],
          labels: []
        };

        if (noteData.labels.length > 0) {
          noteData.labels.forEach(lbl => {
            this.labelService.addLabelToNote(lbl.id, note.id).subscribe({
              next: () => {
                if (!note.labels.some(l => l.id === lbl.id)) {
                  note.labels.push(lbl);
                }
              }
            });
          });
        }

        if (noteData.pinned) {
          this.noteService.togglePin(note.id).subscribe({
            next: () => { note.pinned = true; }
          });
        }

        if (noteData.archived) {
          this.noteService.toggleArchive(note.id).subscribe({
            next: () => {
              note.archived = true;
              if (this.activeSection === 'notes') {
                this.notes = this.notes.filter(n => n.id !== note.id);
              }
            }
          });
        }

        if (noteData.collaborators.length > 0) {
          noteData.collaborators.forEach(email => {
            this.noteService.addCollaborator(note.id, email).subscribe({
              next: () => {
                if (!note.collaborators.includes(email)) {
                  note.collaborators.push(email);
                }
              }
            });
          });
        }

        if (!noteData.archived || this.activeSection === 'archive') {
          this.notes.unshift(note);
        }
      },
      error: (err: any) => console.error('Failed to create note:', err)
    });
  }

  handleTrashNewNote(noteData: { title: string; content: string; color: string }): void {
    const noteDTO = {
      title: noteData.title,
      content: noteData.content || ' ',
      color: noteData.color
    };
    this.noteService.createNote(noteDTO).subscribe({
      next: (response: any) => {
        const created = response.data as NoteResponseDTO;
        this.noteService.toggleTrash(created.id).subscribe({
          next: () => {
            if (this.activeSection === 'trash') {
              this.loadNotes();
            }
          },
          error: (err: any) => console.error('Failed to trash new note:', err)
        });
      },
      error: (err: any) => console.error('Failed to create note before trashing:', err)
    });
  }

  togglePin(eventData: { note: Note; event?: Event }): void {
    const { note } = eventData;
    this.noteService.togglePin(note.id).subscribe({
      next: () => { note.pinned = !note.pinned; },
      error: (err: any) => console.error('Failed to toggle pin:', err)
    });
  }

  archiveNote(eventData: { note: Note; event?: Event }): void {
    const { note } = eventData;
    this.noteService.toggleArchive(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== note.id);
      },
      error: (err: any) => console.error('Failed to archive note:', err)
    });
  }

  unarchiveNote(eventData: { note: Note; event?: Event }): void {
    const { note } = eventData;
    this.noteService.toggleArchive(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== note.id);
      },
      error: (err: any) => console.error('Failed to unarchive note:', err)
    });
  }

  setNoteColor(eventData: { note: Note; color: string; event?: Event }): void {
    const { note, color } = eventData;
    const oldColor = note.color;
    note.color = color;

    this.noteService.updateNote(note.id, {
      title: note.title,
      content: note.content || ' ',
      color: color
    }).subscribe({
      error: (err: any) => {
        console.error('Failed to update color:', err);
        note.color = oldColor;
      }
    });
  }

  trashNote(eventData: { note: Note; event?: Event }): void {
    const { note } = eventData;
    this.noteService.toggleTrash(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== note.id);
      },
      error: (err: any) => console.error('Failed to trash note:', err)
    });
  }

  restoreNote(eventData: { note: Note; event?: Event }): void {
    const { note } = eventData;
    this.noteService.toggleTrash(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== note.id);
      },
      error: (err: any) => console.error('Failed to restore note:', err)
    });
  }

  deleteForever(eventData: { note: Note; event?: Event }): void {
    const { note } = eventData;
    this.noteService.deleteNote(note.id).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== note.id);
      },
      error: (err: any) => console.error('Failed to delete note:', err)
    });
  }

  // ══════════════ LABEL OPERATIONS ON NOTES ══════════════
  toggleLabelForNote(eventData: { note: Note; label: Label; event?: Event }): void {
    const { note, label } = eventData;
    const exists = note.labels.some(l => l.id === label.id);
    if (exists) {
      this.labelService.removeLabelFromNote(label.id, note.id).subscribe({
        next: () => {
          note.labels = note.labels.filter(l => l.id !== label.id);
        },
        error: (err: any) => console.error('Failed to remove label:', err)
      });
    } else {
      this.labelService.addLabelToNote(label.id, note.id).subscribe({
        next: () => {
          note.labels.push(label);
        },
        error: (err: any) => console.error('Failed to add label:', err)
      });
    }
  }

  removeLabelFromNote(eventData: { note: Note; labelId: number; event?: Event }): void {
    const { note, labelId } = eventData;
    this.labelService.removeLabelFromNote(labelId, note.id).subscribe({
      next: () => {
        note.labels = note.labels.filter(l => l.id !== labelId);
      },
      error: (err: any) => console.error('Failed to remove label chip:', err)
    });
  }

  createLabelFromMenu(eventData: { note: Note; name: string }): void {
    const { note, name } = eventData;
    this.labelService.createLabel({ name }).subscribe({
      next: (res: any) => {
        if (res.data) {
          const newLab = { id: res.data.id, name: res.data.name };
          this.labels = [...this.labels, newLab];
          if (note) {
            this.toggleLabelForNote({ note, label: newLab });
          }
        }
      },
      error: (err: any) => console.error('Failed to create label from menu:', err)
    });
  }

  // ══════════════ REMINDER OPERATIONS ══════════════
  handleSetReminder(eventData: { note: Note; reminderTime: string }): void {
    const { note, reminderTime } = eventData;

    // Optimistically show chip immediately for instant feedback
    note.reminder = reminderTime;

    this.noteService.setReminder(note.id, reminderTime).subscribe({
      next: (response: any) => {
        // Confirm with authoritative backend value
        const savedReminder = response?.data?.reminder ?? reminderTime;
        note.reminder = savedReminder;
        this.toastService.info('🔔 Reminder set for ' + this.reminderService.formatReminderDisplay(savedReminder));
      },
      error: (err: any) => {
        console.error('Failed to set reminder:', err);
        // Roll back optimistic update
        note.reminder = undefined;
        const msg = err?.error?.message || 'Failed to set reminder. Make sure the time is in the future.';
        this.toastService.info('⚠️ ' + msg);
      }
    });
  }


  handleRemoveReminder(eventData: { note: Note }): void {
    const { note } = eventData;
    this.noteService.removeReminder(note.id).subscribe({
      next: () => {
        note.reminder = undefined;
        this.toastService.info('Reminder removed.');
      },
      error: (err: any) => console.error('Failed to remove reminder:', err)
    });
  }

  // ══════════════ EDIT NOTE MODAL ══════════════
  openEditModal(note: Note): void {
    if (note.trashed) return;
    this.editingNote = note;
  }

  saveEditModal(eventData: { note: Note; title: string; content: string }): void {
    const { note, title, content } = eventData;
    const updatedTitle = title.trim();
    const updatedContent = content.trim();

    if (updatedTitle !== note.title || updatedContent !== note.content) {
      note.title = updatedTitle;
      note.content = updatedContent;

      this.noteService.updateNote(note.id, {
        title: updatedTitle,
        content: updatedContent || ' ',
        color: note.color
      }).subscribe({
        error: (err: any) => console.error('Failed to update note:', err)
      });
    }
    this.editingNote = null;
  }

  // ══════════════ EDIT LABELS MODAL ══════════════
  openEditLabelsModal(): void {
    this.showEditLabelsModal = true;
  }

  closeEditLabelsModal(): void {
    this.showEditLabelsModal = false;
  }

  createLabel(name: string): void {
    this.labelService.createLabel({ name }).subscribe({
      next: (res: any) => {
        if (res.data) {
          const newLab = { id: res.data.id, name: res.data.name };
          this.labels = [...this.labels, newLab];
        }
      },
      error: (err: any) => console.error('Failed to create label:', err)
    });
  }

  updateLabel(eventData: { label: Label; name: string }): void {
    const { label, name } = eventData;
    this.labelService.updateLabel(label.id, { name }).subscribe({
      next: () => {
        label.name = name;
      },
      error: (err: any) => console.error('Failed to update label:', err)
    });
  }

  deleteLabel(label: Label): void {
    this.labelService.deleteLabel(label.id).subscribe({
      next: () => {
        this.labels = this.labels.filter(l => l.id !== label.id);
        this.notes.forEach(note => {
          note.labels = note.labels.filter(l => l.id !== label.id);
        });
        if (this.activeSection === 'label_' + label.id) {
          this.setActiveSection('notes');
        }
      },
      error: (err: any) => console.error('Failed to delete label:', err)
    });
  }

  // ══════════════ COLLABORATOR MODAL ══════════════
  openCollaboratorModal(eventData?: { note: Note; event?: Event }): void {
    this.editingCollaboratorsNote = eventData ? eventData.note : null;
    this.showCollaboratorModal = true;
    this.isAddingCollaborator = false;

    if (this.editingCollaboratorsNote) {
      const note = this.editingCollaboratorsNote;
      this.noteService.getCollaborators(note.id).subscribe({
        next: (response: any) => {
          if (response.data) {
            note.collaborators = response.data.map((c: any) => typeof c === 'string' ? c : (c.email || c));
          }
        },
        error: (err: any) => console.error('Failed to fetch collaborators:', err)
      });
    }
  }

  closeCollaboratorModal(): void {
    this.showCollaboratorModal = false;
    this.editingCollaboratorsNote = null;
    this.isAddingCollaborator = false;
  }

  addCollaborator(email: string): void {
    if (!this.editingCollaboratorsNote) {
      return;
    }
    this.isAddingCollaborator = true;
    const noteId = this.editingCollaboratorsNote.id;
    this.noteService.addCollaborator(noteId, email).subscribe({
      next: () => {
        if (this.editingCollaboratorsNote && !this.editingCollaboratorsNote.collaborators.includes(email)) {
          this.editingCollaboratorsNote.collaborators = [...this.editingCollaboratorsNote.collaborators, email];
        }
        this.isAddingCollaborator = false;
      },
      error: (err: any) => {
        console.error('Failed to add collaborator:', err);
        this.isAddingCollaborator = false;
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : 'Failed to add collaborator');
        this.toastService.show(msg, 'error');
      }
    });
  }

  removeCollaborator(email: string): void {
    if (!this.editingCollaboratorsNote) {
      return;
    }
    const noteId = this.editingCollaboratorsNote.id;
    this.noteService.removeCollaborator(noteId, email).subscribe({
      next: () => {
        if (this.editingCollaboratorsNote) {
          this.editingCollaboratorsNote.collaborators =
            this.editingCollaboratorsNote.collaborators.filter(e => e !== email);
        }
      },
      error: (err: any) => console.error('Failed to remove collaborator:', err)
    });
  }
}
