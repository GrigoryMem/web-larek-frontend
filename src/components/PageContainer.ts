import {Component} from "./base/Component";
import {IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";



interface IPageContainer {
  counter: number;
  catalog: HTMLElement;
  locked:boolean;
}

export class PageContainer extends Component<IPageContainer>{
    protected _counter:HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLButtonElement;

    constructor(container:HTMLElement, events: IEvents) {
        super(container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._catalog = ensureElement<HTMLElement>(".gallery", container);
        this._wrapper = ensureElement<HTMLElement>(".page__wrapper", container);
        this._basket = ensureElement<HTMLButtonElement>(".header__basket", container);

        this._basket.addEventListener('click', () => {
            events.emit('basket:open');
            console.log('Click basket');
        });
    }

set counter(value: number){
   this.setText(this._counter,String(value))
}

set catalog(items: HTMLElement[]){
    this._catalog.replaceChildren(...items);
}

set locked(value:boolean) {
    this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
}

}