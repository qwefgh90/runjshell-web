import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { WebsocketService } from './websocket.service';


describe('WebsocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebsocketService = TestBed.get(WebsocketService);
    expect(service).toBeTruthy();
  });
  
  it('should make connection between websocket and server', (done: DoneFn) => {
    const service: WebsocketService = TestBed.get(WebsocketService);
    expect(service).toBeTruthy();
    let url = 'ws://example.com/ex'
    let ws = service.websocket(url)
    let error: Observable<Event> = ws.onError
    let close: Observable<CloseEvent> = ws.onClose
    let message: Observable<MessageEvent> = ws.onMessage
    let open: Observable<Event> = ws.onOpen
    error.subscribe((e) => {
      let readyState: number = ws.readyState();
      expect(readyState).toBe(3)
      done()
    })
  })

  it('should make a connection between websocket and echo server', (done: DoneFn) => {
    const service: WebsocketService = TestBed.get(WebsocketService);
    expect(service).toBeTruthy();
    let url = 'ws://echo.websocket.org/'
    let ws = service.websocket(url)
    let error: Observable<Event> = ws.onError
    let close: Observable<CloseEvent> = ws.onClose
    let message: Observable<MessageEvent> = ws.onMessage
    let open: Observable<Event> = ws.onOpen
    let readyState: number = ws.readyState();
    open.subscribe((e) => {
      let readyState: number = ws.readyState();
      expect(readyState).toBe(1)
      done()
    })
  })

  it('should make a connection between websocket and echo server', (done: DoneFn) => {
    const service: WebsocketService = TestBed.get(WebsocketService);
    expect(service).toBeTruthy();
    let url = 'ws://echo.websocket.org/'
    let ws = service.websocket(url)
    let error: Observable<Event> = ws.onError 
    let close: Observable<CloseEvent> = ws.onClose
    let message: Observable<MessageEvent> = ws.onMessage
    let open: Observable<Event> = ws.onOpen
    let readyState: number = ws.readyState();
    message.subscribe((e) => {
      ws.close();
      readyState = ws.readyState();
      expect(readyState).toBe(2)
      done()
    })

    open.subscribe((e) => {
      let readyState: number = ws.readyState();
      expect(readyState).toBe(1)
      ws.send('something')
    })
  })

  it('should send and receive a message between websocket and echo server', (done: DoneFn) => {
    const service: WebsocketService = TestBed.get(WebsocketService);
    expect(service).toBeTruthy();
    let url = 'ws://echo.websocket.org/'
    let ws = service.websocket(url)
    let error: Observable<Event> = ws.onError
    let close: Observable<CloseEvent> = ws.onClose
    let message: Observable<MessageEvent> = ws.onMessage
    let open: Observable<Event> = ws.onOpen
    let readyState: number = ws.readyState();
    let msgBack = 'echo works!'
    open.subscribe((e) => {
      ws.send(msgBack)
    })
    message.subscribe((e) => {
      expect(e.data).toBe(msgBack)
      done()
    })
  })
});
