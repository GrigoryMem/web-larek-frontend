import { EventEmitter } from "./base/events";``
import { TCatalogProduct } from "../types/index";
import { IView,IViewConstructor } from "../types";

// Удалить!!!!!!!

//   отображения отдельного товара в корзине

class BasketItemView implements IView {
  // Элементы внутри контейнера
  protected title: HTMLSpanElement;
  protected addButton:HTMLButtonElement;
  protected removeButton:HTMLButtonElement;
  // данные которые хотим сохранить на будущее
  protected id:string | null = null;

  constructor(protected container: HTMLElement, protected events: EventEmitter){
    // инициализируем, чтобы не искать повторно
    this.title = container.querySelector('.basket-item__title') as HTMLSpanElement;
    this.addButton = container.querySelector('.basket-item__add') as HTMLButtonElement;
    this.removeButton = container.querySelector('.basket-item__remove') as HTMLButtonElement;

    // устанавливаем события
    this.addButton.addEventListener('click',()=>{
        // генерируем событие в нашем брокере
        this.events.emit('ui:basket-add', {id: this.id})
    });

    this.removeButton.addEventListener('click',()=>{
      this.events.emit('ui:basket-remove', {id: this.id})
    })
   
    
  }
  render(data?: TCatalogProduct): HTMLElement {
     // если есть новые данные то заполним их
    if(data){
      this.id = data.id

      this.title.textContent = data.title;
    }
 // и выведем в интерфейс
    return this.container
  } 

}
 









 



 


