// import { IView,IViewConstructor } from "../types";

import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

//  интерфейс для отображения динамических элементов корзины
export interface IBasketView {
  items:HTMLElement[] | HTMLElement;
  totalPrice:number;
}

type onPurchase = (event: MouseEvent) => void;

interface IBasketViewActions {
  onClick: onPurchase
}

export class BasketView extends Component<IBasketView> {

  protected _items:HTMLElement;
  protected _totalPrice:HTMLElement;
  protected _button:HTMLElement;


  constructor(protected container:HTMLElement,actions?:IBasketViewActions) {
      super(container);
      this._items = ensureElement('.basket__list', container) as HTMLElement;
      this._totalPrice = ensureElement('.basket__price', container) as HTMLElement;
      this._button = ensureElement('.basket__button', container) as HTMLElement;
      if(actions?.onClick && this._button){
        this._button.addEventListener('click', actions.onClick);
      }

  }

  set  items(items:HTMLElement[]) {
    this._items.replaceChildren(...items);
  }

  set totalPrice(value:number) {
    this._totalPrice.textContent = value.toString();
  }
 
}