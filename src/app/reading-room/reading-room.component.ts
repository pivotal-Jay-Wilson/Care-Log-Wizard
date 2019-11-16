import { Component, OnInit } from '@angular/core';
import { GapiSession } from '../google/gapi.session';
import { CveService } from '../cve.service';
import { ReadingroomService } from '../readingroom.service';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { ReadingRoomLink } from '../reading-room-link';
import { MatCheckboxComponent } from '../grid/mat-checkbox.component';
import { GridOptions } from 'ag-grid-community';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-reading-room',
  templateUrl: './reading-room.component.html',
  styleUrls: ['./reading-room.component.scss']
})
export class ReadingRoomComponent implements OnInit {
  opened: boolean;
  isDarkTheme = false;
  ctx: GapiSession;
  cves: CveService;
  rowData: ReadingRoomLink[];
  running = false;
  private gridApi;
  private gridColumnApi;
  private readingroomService;
  gridOptions: GridOptions;

  columnDefs = [
    { headerName: 'Select', field: 'select', cellRenderer: 'checkboxRenderer'},
    { headerName: 'Title', field: 'title', sortable: true, filter: true, resizable: true },
    { headerName: 'Url', field: 'url', sortable: true, filter: true, resizable: true },
    { headerName: 'Name', field: 'authorId', sortable: true, filter: true, resizable: true },
    { headerName: 'Category', field: 'categoryId', sortable: true, filter: true, resizable: true },
    { headerName: 'Date Saved', field: 'createdAt', sortable: true, filter: true, resizable: true },
  ];


  constructor(appContext: GapiSession, cveService: CveService, readingroomService: ReadingroomService) {
    this.ctx = appContext;
    this.cves = cveService;
    this.readingroomService = readingroomService;
    this.gridOptions = {
      onGridReady: params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
      },
      rowData: this.rowData,
      columnDefs: this.columnDefs,
      rowHeight: 48, // recommended row height for material design data grids,
      frameworkComponents: {
        checkboxRenderer: MatCheckboxComponent,
        // inputRenderer: MatInputComponent,
        // radioEditor: MatRadioComponent,
        // selectEditor: MatSelectComponent
      }
    } as GridOptions;
    this.readingroomService.getRr().subscribe((data: ReadingRoomLink[]) => {
      this.gridOptions.api.setRowData(data);
    });
  }

  ngOnInit() {

  }

 createFiles(e) {
    switch (e) {
      case 'slideshow':
        this.createSlides();
        break;
      case 'picture_as_pdf':
         this.createPDF();
         break;
      case 'picture_as_pdf':
        console.log('TODO');
        break;
    }
  }

  async createSlides() {
    const request = {
      name: 'New Care Log'
    };
    this.running = true;
    try {
      const driveResponse = await this.ctx.gapi.client.drive.files.copy({
        fileId: '13bFJbdqjSxA6xbLd-7qDFTEtYjSZyJ8i2HQOHLwBIfU',
        resource: request
      });
      const presentationId = driveResponse.result.id;
      const response = await this.ctx.gapi.client.slides.presentations.get({ presentationId });

      let bulletsArticlesList = '';
      const bulletsArticlesPosition = new Set<bp>();
      let bulletsWebinarsList = '';
      const bulletsWebinarsPosition = new Set<bp>();
      this.gridApi.forEachNode((node, index) => {
          if (node.data.select) {
          switch (node.data.categoryId) {
            case 'Articles and Blog Posts':
              bulletsArticlesList += '\n\t' + node.data.title;
              this.addTOSet(bulletsArticlesPosition, node.data.title, node.data.url);
              break;
            case 'Webinars and Events':
              bulletsWebinarsList += '\n\t' + node.data.title;
              this.addTOSet(bulletsWebinarsPosition, node.data.title, node.data.url);
              break;
            }
        }
      });
      const requests = [];
      requests.push({
        insertText: {
          objectId: 'g39e41a8dc1_1_5',
          text: `Articles and Blog Posts${bulletsArticlesList}\nWebinars and Events${bulletsWebinarsList}`,
        },
      });
      let lastend = 'Articles and Blog Posts'.length + 2;
      let firstend = 0;
      for (const node of bulletsArticlesPosition) {
        node.textRange.startIndex += lastend;
        node.textRange.endIndex += lastend;
        firstend = node.textRange.endIndex;
        requests.push({
          updateTextStyle: {
            objectId: 'g39e41a8dc1_1_5',
            style: node.style,
            textRange: node.textRange,
            fields: 'link, foregroundColor',
          }
        });
      }
      const endIndex = firstend;
      firstend += '\nWebinars and Events'.length + 2;
      for (const node of bulletsWebinarsPosition) {
        node.textRange.startIndex += firstend;
        node.textRange.endIndex += firstend;
        requests.push({updateTextStyle: {
           objectId: 'g39e41a8dc1_1_5',
           style: node.style,
           textRange: node.textRange,
           fields: 'link',
           }
         });
      }

      requests.push({createParagraphBullets: {
        objectId: 'g39e41a8dc1_1_5',
        textRange: { type: 'FIXED_RANGE', startIndex: lastend, endIndex  },
       }});

      const response1 = await this.ctx.gapi.client.slides.presentations.batchUpdate({ presentationId, requests });
      console.log(response1);

    } catch (error) {
      console.log(error);
    }
    this.running = false;
  }

  addTOSet(set: Set<bp>, name: string, url ) {
    const lastValue: any = Array.from(set).pop();
    let startIndex  = 0;
    if (lastValue) {
      startIndex = lastValue.textRange.endIndex + 2;
    }
    const endIndex = startIndex + name.length;
    set.add(
      { style: { link: { url },  foregroundColor: { opaqueColor: { themeColor: 'LIGHT1' } } }, textRange: { type: 'FIXED_RANGE', startIndex, endIndex } }
    );

  }
  createPDF() {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontStyle('bold');
    doc.setFontSize(18);
    doc.text('CareLog Reading Room', 10, 34);
    const img = new Image();
    img.src = '/assets/pivotal.png';
    doc.addImage(img, 'PNG', 10, 10, 32, 12);
    doc.line(10, 40, 200, 40);
    doc.setFontSize(12);
    const textX = 15;
    let textY = 50;
    let cat  = '';
    this.gridApi.forEachNode((node, index) => {
      if (node.data.select) {
        if (cat !== node.data.categoryId) {
          cat = node.data.categoryId;
          doc.setFontSize(16);
          doc.textWithLink(cat, textX - 5 , textY + .5, {url: node.data.url});
          textY += 10;
        }
        doc.setFontSize(6);
        doc.setFontStyle('normal');
        doc.setFont('ZapfDingbats');
        doc.text('l', textX, textY);
        doc.setFontSize(12);
        doc.setFont('helvetica');
        doc.setFontStyle('bold');
        doc.textWithLink(node.data.title, textX + 3, textY + .5, {url: node.data.url});
      }
      textY += 10;
    });
    doc.save('CareLog.pdf');
  }
}

// TODO: move this
interface bp {
  style: object;
  textRange: textRange;
}
interface textRange {
   type: string;
   startIndex: number;
   endIndex: number;
 }
