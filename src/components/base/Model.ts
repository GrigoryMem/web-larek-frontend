import {IEvents} from "./events";

// Гарда для проверки на модель

export const isModel = (obj: unknown): obj is Model<any> => {
  return obj instanceof Model; //Проверяет: является ли объект obj экземпляром класса Model
}
/**
 * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
 */
// Это базовый класс для всех моделей данных
export abstract class Model<T> {
  constructor(data: Partial<T>, protected events: IEvents) {
      Object.assign(this, data);
      // Object.assign(this, data) — копирует все свойства из data прямо в экземпляр класса (this)
  }

  // Сообщить всем что модель поменялась
  emitChanges(event: string, payload?: object) {
      // Состав данных можно модифицировать
      // Это способ сообщить другим частям приложения, что модель изменилась
      this.events.emit(event, payload ?? {});
  }

  // далее можно добавить общие методы для моделей
}