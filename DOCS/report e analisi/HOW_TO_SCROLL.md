# Come Abilitare lo Scroll in Aree Specifiche

Per design, lo scroll verticale dell'intera pagina è bloccato per garantire un'esperienza utente simile a un'app nativa su mobile.

Per abilitare lo scroll verticale all'interno di un componente specifico (es. una lista, una tabella o un pannello di contenuto), è sufficiente applicare la classe CSS `.scrollable-area` al contenitore che deve scorrere.

## Esempio di Utilizzo

```jsx
// In un componente React

function MyScrollableListComponent({ items }) {
  return (
    // Applica la classe al contenitore che deve avere lo scroll
    <div className="flex-1 overflow-y-auto scrollable-area">
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

**Regole chiave della classe `.scrollable-area`:**

- `overflow-y: auto;`: Abilita lo scroll verticale solo se il contenuto eccede l'altezza del contenitore.
- `-webkit-overflow-scrolling: touch;`: Garantisce uno scroll fluido e con inerzia sui dispositivi iOS.
- `overscroll-behavior-y: contain;`: Isola lo scroll, impedendo che la gesture di scroll "rimbalzi" o si propaghi agli elementi genitore (effetto "scroll chaining").
- `touch-action: pan-y;`: Indica al browser che l'elemento gestirà solo le gesture di pan verticale, migliorando la reattività.
