import { IView,IViewConstructor } from "../types";


export class BasketView implements IView {

  constructor(protected container:HTMLElement) {}
  render(data: {items:HTMLElement[]})  {
    if(data){
      this.container.replaceChildren(...data.items);
      // ...data.items  ??? почему точки разберись
    }
    return this.container
  }
}