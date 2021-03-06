import { Component, Input, Output, Pipe, PipeTransform, ViewChild, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { ImportServiceCfg } from './import.service'
import { TreeView} from './treeview';

@Component({
  selector: 'import-file-modal',
  template: `
      <div bsModal #childModal="bs-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" (click)="childModal.hide()" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">{{titleName}} {{importResult ? importResult.Info.FileName  : 'Select File' }}</h4>
              </div>
              <div class="modal-body">
              <div>
              <div *ngIf="importResult">

              <div class="panel panel-default">
              <div class="panel-heading">
                <div class="text-left">
                  <span>{{importResult.Info.FileName}}
                  <label style="margin-left:10px" *ngFor="let tag of importResult.Info.Tags | splitComma" class="label label-info">{{tag}}</label>
                  </span>
                </div>

              </div>
              <div class="panel-body">
                <p>"{{importResult.Info.Description}}"</p>
              </div>
              <div class="text-right">
                  <span>by {{importResult.Info.Author}}</span>
              </div>
              </div>
              <h4 [ngClass]="importResult.IsOk === true ? ['text-success'] : ['text-danger']">
              Result:
              <i [ngClass]="importResult.IsOk === true ? ['glyphicon glyphicon-ok-circle'] : ['glyphicon glyphicon-remove-circle']"></i>
                - {{ importResult.Message}} </h4>
              <div class="text-right">
                <label class="control-label" for="AutoRename">AutoRename</label>
                  <select name="auto_rename" id="auto_rename" [(ngModel)]="auto_rename">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
              </div>
                <div style="max-height:350px; overflow-y:scroll">
                <div *ngFor="let a of importResult.Duplicated;  let i = index" >
                <treeview [visible]="false" [title]="a.ObjectID" [type]="a.ObjectTypeID" [object]="a.ObjectCfg"> </treeview>
                </div>
                </div>
              </div>

              <div *ngIf="!importResult">
                <form (ngSubmit)="uploadFile()" class="form-horizontal">
                <div class="form-group">
                  <label class="control-label col-sm-2" for="AutoRename">AutoRename</label>
                  <i placement="top" style="float: left" class="info control-label glyphicon glyphicon-info-sign" tooltipAnimation="true" tooltip="Auto rename duplicated objects"></i>
                  <div class="col-sm-9">
                    <select name="auto_rename" id="auto_rename" [(ngModel)]="auto_rename">
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-2" for="File">File</label>
                  <i placement="top" style="float: left" class="info control-label glyphicon glyphicon-info-sign" tooltipAnimation="true" tooltip="File with data to import"></i>
                  <div class="col-sm-9">
                    <input name="export_file" type="file" (change)="selectFile($event)" style="width:100% !important" /><br />
                  </div>
                </div>
              </form>
              </div>
              </div>
              </div>
              <div class="modal-footer" *ngIf="showValidation === true">
               <button type="button" class="btn btn-primary" (click)="childModal.hide()">Close</button>
               <button *ngIf="!importResult" type="button" class="btn btn-primary" [disabled]="!files" (click)="uploadFile()">{{textValidation ? textValidation : Save}}</button>
               <span *ngIf="importResult">
               <button *ngIf="importResult.IsOk === false" type="button" class="btn btn-primary" [disabled]="auto_rename === false" (click)="uploadFile()">Import</button>
               </span>

             </div>
            </div>
          </div>
        </div>`,
  styleUrls: ['./import-modal-styles.css'],
  providers: [ImportServiceCfg, TreeView]
})

export class ImportFileModal {
  @ViewChild('childModal') public childModal: ModalDirective;
  @Input() titleName: any;
  @Input() customMessage: string;
  @Input() showValidation: boolean;
  @Input() textValidation: string;

  @Output() public validationClicked: EventEmitter<any> = new EventEmitter();

  public validationClick(myId: string): void {
    this.validationClicked.emit(myId);
  }

  public files: File;
  public auto_rename: boolean = true;
  public builder: any;
  public exportForm: any;
  public importResult: any;

  show() {
    this.childModal.show();
  }

  constructor(public importServiceCfg: ImportServiceCfg, builder: FormBuilder) {
    this.builder = builder;
  }

  initImport() {
    this.files = null;
    this.importResult = null;
    this.auto_rename = false;
    this.childModal.show();
  }

  selectFile(event) {
    this.files = event.srcElement.files;
  }

  uploadFile() {
    this.importServiceCfg.importItem({ 'auto_rename': this.auto_rename, 'files': this.files })
      .subscribe(
      data => {
        this.importResult = data;
      },
      err => console.error(err),
      () => { }
      );
  }

  hide() {
    this.childModal.hide();
  }

}
