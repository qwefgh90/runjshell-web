import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent, minTermHeight, minTermWidth } from './app.component';
import { ResizableModule } from 'angular-resizable-element';
import { ResizeEvent } from 'angular-resizable-element';
import { RxWebsocket, WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs';
import { detectChanges } from '@angular/core/src/render3';
import { environment } from 'src/environments/environment';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ResizableModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Online JShell'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Online JShell');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to Online JShell!');
  });

  it('should render #terminal element', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#terminal')).toBeDefined('Terminal doesn\'t exists');
  });

  it('should render textarea in Terminal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app: AppComponent = fixture.debugElement.componentInstance;
    expect(app.term.textarea.textContent).toBeDefined("textaera should be a child of Terminal");
  });

  it('should check width and height exceed smallest size of each one', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    let left, top, width, height = 0;
    const re: ResizeEvent = {rectangle: {left: left, top: top, width: width, height: height, bottom: undefined, right: undefined}, edges: undefined};
    re.rectangle.width = minTermWidth;
    re.rectangle.height = minTermHeight;
    expect(app.validate(re)).toBe(true);
    re.rectangle.width = minTermWidth - 1;
    re.rectangle.height = minTermHeight - 1;
    expect(app.validate(re)).toBe(false);
  })

  it('should make a terminal fit in dimension of div', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    app.onResizeEnd(0,0, minTermWidth, minTermHeight);
    fixture.detectChanges();
    let beforeRows = app.term.rows;
    let beforeCols = app.term.cols;
    app.onResizeEnd(0,0, minTermWidth+500, minTermHeight+500);
    fixture.detectChanges();
    let afterRows = app.term.rows;
    let afterCols = app.term.cols;
    expect(beforeRows).not.toBe(afterRows);
    expect(beforeCols).not.toBe(afterCols);
  })

  function keydown(char: string){
    const init = {key: char, keyCode: '68'};
    return new KeyboardEvent('keydown', init);
  }

  it('should type inputs through terminal', (done: DoneFn) => {
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    const compiled = fixture.debugElement.nativeElement;
    fixture.detectChanges()

    const terminalEventConsumer = compiled.querySelector('#terminal').getElementsByTagName('textarea')[0]
    const inputToType = ['h','i','!','\n'];
    const arrToReceive = [];
    app.keyInput.subscribe(v => {
      arrToReceive.push(v);
      if(arrToReceive.length == inputToType.length){
        const trueOrFalseList = inputToType.map((v, i) => {
          if(v == arrToReceive[i]){
            return true;
          }else
            return false;
        });
        if(trueOrFalseList.every((v) => v)){
          done();
        }else{
          fail('inputs aren\'t expected. ' + arrToReceive.toString());
        }
      }
    })

    inputToType.forEach((v) => {
      terminalEventConsumer.dispatchEvent(keydown(v));
    })
    fixture.detectChanges()

  })

  it('should connect with websocket service', (done: DoneFn) => {
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    let url = 'ws://echo.websocket.org/'
    let ws: RxWebsocket = app.connect(url);
    ws.onOpen.subscribe(e => {
      expect(ws.readyState()).toBe(WebSocket.OPEN);
      done();
    });
  })

  it('should receive inital banner', (done: DoneFn) => {
    //this is fake server with echo server
    //environment.backend = 'ws://echo.websocket.org/'
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    const expectedBanner = "Welcome to RunJShell!";
    fixture.detectChanges();
    app.connectWithTerminal(app.connect('ws://echo.websocket.org/'), app.term, app.keyInput);
    let arr = []; 
    app.ws.onOpen.subscribe(e => {
      if (app.ws.readyState() == WebSocket.OPEN) {
        app.ws.onMessage.subscribe(me => {
          arr.push(me.data);
          if (arr.join('').length == expectedBanner.length) {
            expect(arr.join('')).toBe(expectedBanner);
            done();
          }
        });
        //this message is sent from fake server wich echo server
        app.ws.send(expectedBanner);
      }
    });
    
  })
});