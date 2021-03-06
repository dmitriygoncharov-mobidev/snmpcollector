import { Component, Input, Output, Pipe, PipeTransform, ViewChild, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { ExportServiceCfg } from './export.service'
import { TreeView} from './treeview';

@Component({
  selector: 'export-file-modal',
  template: `
      <div bsModal #childModal="bs-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" (click)="childModal.hide()" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title" *ngIf="exportObject != null">{{titleName}} <b>{{ exportObject.ID }}</b> - <label [ngClass]="['label label-'+colorsObject[exportType]]">{{exportType}}</label></h4>
              </div>
              <div class="modal-body">
              <div *ngIf="exportResult === true" style="overflow-y: scroll; max-height: 350px">
                <h4 class="text-success"> <i class="glyphicon glyphicon-ok-circle" style="padding-right:10px"></i>Succesfully exported {{exportedItem.Objects.length}} items </h4>
                <div *ngFor="let object of exportedItem.Objects; let i=index">
                  <treeview [visible]="false" [title]="object.ObjectID" [type]="object.ObjectTypeID" [object]="object.ObjectCfg"> </treeview>
              </div>
              </div>
              <div  *ngIf="exportForm && exportResult === false">
              <form [formGroup]="exportForm" class="form-horizontal"  >
                    <div class="form-group">
                      <label for="FileName" class="col-sm-4 control-FileName">FileName</label>
                      <div class="col-sm-8">
                      <input type="text" class="form-control" placeholder="file.json" formControlName="FileName" id="FileName">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="Author" class="col-sm-4 control-Author">Author</label>
                      <div class="col-sm-8">
                      <input type="text" class="form-control" placeholder="snmpcollector" formControlName="Author" id="Author">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="Tags" class="col-sm-4 control-Tags">Tags</label>
                      <div class="col-sm-8">
                      <input type="text" class="form-control" placeholder="cisco,catalyst,..." formControlName="Tags" id="Tags">
                      </div>
                    </div>
                    <div class="form-group">
                    <label for="FileName" class="col-sm-4 control-FileName">Description</label>
                    <div class="col-sm-8">
                    <textarea class="form-control" style="width: 100%" rows="2" formControlName="Description" id="Description"> </textarea>
                    </div>
                    </div>
              </form>
              </div>
              </div>
              <div class="modal-footer" *ngIf="showValidation === true">
               <button type="button" class="btn btn-default" (click)="childModal.hide()">Close</button>
               <button *ngIf="exportResult === false" type="button" class="btn btn-primary" (click)="exportItem()">{{textValidation ? textValidation : Save}}</button>
             </div>
            </div>
          </div>
        </div>`,
    providers: [ExportServiceCfg, TreeView]
})

export class ExportFileModal {
  @ViewChild('childModal') public childModal: ModalDirective;
  @Input() titleName: any;
  @Input() customMessage: string;
  @Input() showValidation: boolean;
  @Input() textValidation: string;

  @Output() public validationClicked: EventEmitter<any> = new EventEmitter();

  public validationClick(myId: string): void {
    this.validationClicked.emit(myId);
  }

  public builder: any;
  public exportForm: any;

  constructor(builder: FormBuilder, public exportServiceCfg : ExportServiceCfg) {
    this.builder = builder;
  }

  createStaticForm() {
    this.exportForm = this.builder.group({
      FileName: ['autogenerated.txt', Validators.required],
      Description: ['Autogenerated', Validators.required],
      Author: ['snmpcollector', Validators.required],
      Tags: ['', Validators.required]
    });
  }

  exportObject: any = null;
  exportType: any = null;
  empty: any = false;
  exportResult : boolean = false;
  exportedItem : any;

  public colorsObject : Object = {
   "snmpdevicecfg" : 'danger',
   "influxcfg" : 'info',
   "measfiltercfg": 'warning',
   "oidconditioncfg" : 'success',
   "customfiltercfg" : 'default',
   "measurementcfg" : 'primary',
   "snmpmetriccfg" : 'warning',
   "measgroupcfg" : 'success'
 };

  clearVars() {
    this.exportResult = false;
    this.exportedItem = [];
    this.exportType = null;
    this.exportObject = null;
  }

  initExportModal(exportObject: any) {
    this.clearVars();
    this.createStaticForm();
    this.exportObject = exportObject.row;
    this.exportType = exportObject.exportType;
    this.childModal.show();
  }

  exportItem(){
    this.exportServiceCfg.exportRecursive(this.exportType,this.exportObject.ID, this.exportForm.value)
    .subscribe(
      data => {
        this.exportedItem = data[1];
        saveAs(data[0],data[1].Info.FileName);
        this.exportResult = true;
      },
      err => console.error(err),
      () => console.log("DONE"),
    );
  }

  isArray(myObject) {
    return myObject instanceof Array;
  }

  isObject(myObject) {
    return typeof myObject === 'object'
  }

  hide() {
    this.childModal.hide();
  }

}
