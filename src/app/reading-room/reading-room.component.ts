import { Component, OnInit } from '@angular/core';
import { GapiSession } from '../google/gapi.session';
import { CveService } from '../cve.service';
import { ReadingroomService } from '../readingroom.service';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { ReadingRoomLink } from '../reading-room-link';
import { MatCheckboxComponent } from '../grid/mat-checkbox.component';
import { GridOptions } from 'ag-grid-community';
import * as jsPDF from 'jspdf';
import * as moment from 'moment';
import { Base64 } from 'js-base64';
import * as mimemessage from 'mimemessage';

@Component({
  selector: 'app-reading-room',
  templateUrl: './reading-room.component.html',
  styleUrls: ['./reading-room.component.scss']
})
export class ReadingRoomComponent implements OnInit {
  opened: boolean;
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
      case 'email':
        this.createMail();
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
              this.addToSet(bulletsArticlesPosition, node.data.title, node.data.url);
              break;
            case 'Webinars and Events':
              bulletsWebinarsList += '\n\t' + node.data.title;
              this.addToSet(bulletsWebinarsPosition, node.data.title, node.data.url);
              break;
            }
        }
      });
      const requests = [];
      requests.push({replaceAllText: {
        containsText: {text: '{{dsename}}'},
        replaceText: 'Jay Wilson'
      }});
      requests.push({replaceAllText: {
        containsText: {text: '{{Renewal}}'},
        replaceText: 'June 1 2020'
      }});
      requests.push({replaceAllText: {
        containsText: {text: '{{now}}'},
        replaceText: moment().format('MMMM Do YYYY'),
      }});

      requests.push({
        insertText: {
          objectId: 'g39e41a8dc1_1_5',
          text: `Articles and Blog Posts${bulletsArticlesList}\nWebinars and Events${bulletsWebinarsList}`,
        },
      });
      const head1len = 'Articles and Blog Posts'.length + 2;
      let sec1endlen = 0;
      // bold and increase font for heading
      requests.push({
        updateTextStyle: {
          objectId: 'g39e41a8dc1_1_5',
          style: {bold: true, fontSize: {magnitude: 16, unit: 'PT'}},
          textRange: { type: 'FIXED_RANGE', startIndex:  0, endIndex: head1len  },
          fields: 'fontSize, bold',
        }});
      //  add links to section 1
      for (const node of bulletsArticlesPosition) {
        node.textRange.startIndex += head1len;
        node.textRange.endIndex += head1len;
        sec1endlen = node.textRange.endIndex;
        requests.push({
          updateTextStyle: {
            objectId: 'g39e41a8dc1_1_5',
            style: node.style,
            textRange: node.textRange,
            fields: 'link, foregroundColor',
          }
        });
      }

      let sec2endlen = 0;
      const head2len = sec1endlen + 'Webinars and Events'.length + 2;
      requests.push({
        updateTextStyle: {
          objectId: 'g39e41a8dc1_1_5',
          style: {bold: true, fontSize: {magnitude: 16, unit: 'PT'}},
          textRange: { type: 'FIXED_RANGE', startIndex:  sec1endlen, endIndex: head2len  },
          fields: 'fontSize, bold',
        }});
      for (const node of bulletsWebinarsPosition) {
        node.textRange.startIndex +=  head2len;
        node.textRange.endIndex +=  head2len;
        sec2endlen = node.textRange.endIndex;
        requests.push({updateTextStyle: {
           objectId: 'g39e41a8dc1_1_5',
           style: node.style,
           textRange: node.textRange,
           fields: 'link, foregroundColor',
           }
         });
        console.log(node.textRange);
        console.log(sec2endlen);
      }

      requests.push({createParagraphBullets: {
        objectId: 'g39e41a8dc1_1_5',
        textRange: { type: 'FIXED_RANGE', startIndex:  head2len, endIndex: sec2endlen  },
       }});

      requests.push({createParagraphBullets: {
        objectId: 'g39e41a8dc1_1_5',
        textRange: { type: 'FIXED_RANGE', startIndex:  head1len, endIndex: sec1endlen  },
       }});

      const response1 = await this.ctx.gapi.client.slides.presentations.batchUpdate({ presentationId, requests });
      console.log(response1);

    } catch (error) {
      console.log(error);
    }
    this.running = false;
  }

  addToSet(set: Set<bp>, name: string, url ) {
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

  async createMail() {
    this.running = true;
    // Build the top-level multipart MIME message.
    const msg = mimemessage.factory({
        contentType: 'multipart/mixed',
        body: []
    });
    msg.header('Message-ID', '<1234qwerty>');

    // Build the multipart/alternate MIME entity containing both the HTML and plain text entities.
    const alternateEntity = mimemessage.factory({
        contentType: 'multipart/alternate',
        body: []
    });
    let bulletsArticlesList = '<H3>Articles and Blog Posts</H3><ol>';
    let bulletsWebinarsList = '<H3>Webinars and Events</H3><ol>';
    this.gridApi.forEachNode((node, index) => {
      if (node.data.select) {
        switch (node.data.categoryId) {
          case 'Articles and Blog Posts':
            bulletsArticlesList += `<li><a href='${node.data.url}'>${node.data.title}</a></li>`;
            break;
          case 'Webinars and Events':
            bulletsWebinarsList += `<li><a href='${node.data.url}'>${node.data.title}</a></li>`;
            break;
          }
      }
    });
    bulletsArticlesList += '</ol>';
    bulletsWebinarsList += '</ol>';

    // Build the HTML MIME entity.
    const htmlEntity = mimemessage.factory({
        contentType: 'text/html;charset=utf-8',
        body: '<H1>CareLog Reading Room</H1><hr><H2>Reading Room</H2>' + bulletsArticlesList + bulletsWebinarsList,
    });



    // Add both the HTML and plain text entities to the multipart/alternate entity.
    alternateEntity.body.push(htmlEntity);

    // Add the multipart/alternate entity to the top-level MIME message.
    msg.body.push(alternateEntity);


    try {
      const base64EncodedEmail = Base64.encodeURI(msg.toString());
      const request = await this.ctx.gapi.client.gmail.users.drafts.create({
        userId: 'jwilson@pivotal.io',
        resource: {
          message: {
            raw: base64EncodedEmail
          }
        }
      });
      console.log(request);
    } catch (error) {
      console.error(error);
    }
    this.running = false;
  }


  onResize(event) {
    this.gridApi.sizeColumnsToFit();
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
