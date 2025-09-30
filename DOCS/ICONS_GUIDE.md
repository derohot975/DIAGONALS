# 🎨 Guida Sistema Icone - DIAGONALE

**Ultimo aggiornamento:** 30 Settembre 2025  
**Sistema:** Iconify + unplugin-icons  
**Collezioni:** Tabler Icons + Lucide Icons

---

## 📦 Collezioni Installate

### **Tabler Icons**
- **Collezione:** `@iconify-json/tabler`
- **Stile:** Outline, stroke-based
- **Icone totali:** 4,000+
- **Uso consigliato:** UI principale, navigazione, azioni

### **Lucide Icons**
- **Collezione:** `@iconify-json/lucide`
- **Stile:** Outline, minimalista
- **Icone totali:** 1,000+
- **Uso consigliato:** Interfaccia moderna, complemento Tabler

---

## 🚀 Come Importare un'Icona

### **Sintassi Base**
```typescript
// Import da Tabler Icons
import IconHome from '~icons/tabler/home';
import IconUser from '~icons/tabler/user';
import IconWine from '~icons/tabler/bottle';

// Import da Lucide Icons
import IconChevronDown from '~icons/lucide/chevron-down';
import IconStar from '~icons/lucide/star';
import IconSettings from '~icons/lucide/settings';

// Uso nei componenti
export default function MyComponent() {
  return (
    <div>
      <IconHome className="icon-md icon-primary" />
      <IconUser className="icon-lg icon-interactive" />
      <IconWine className="icon-xl icon-secondary" />
    </div>
  );
}
```

### **Convenzioni Naming**
- **Tabler:** `~icons/tabler/nome-icona`
- **Lucide:** `~icons/lucide/nome-icona`
- **Custom:** `~icons/custom/nome-icona` (se aggiunte)

---

## 🎯 Standard Visuali

### **Dimensioni Standard**
```css
.icon-xs   /* 16×16px - Testo inline, badge */
.icon-sm   /* 20×20px - Pulsanti piccoli */
.icon-md   /* 24×24px - Default, UI generale */
.icon-lg   /* 28×28px - Pulsanti principali */
.icon-xl   /* 32×32px - Header, elementi importanti */
```

### **Stroke e Stile**
```css
.icon-thin    /* stroke-width: 1 */
.icon-normal  /* stroke-width: 2 (default) */
.icon-thick   /* stroke-width: 2.5 */
```

### **Colori Tematici DIAGONALE**
```css
.icon-primary    /* Rosso bordeaux (#991b1b) */
.icon-secondary  /* Blu accento (#2563eb) */
.icon-success    /* Verde (#22c55e) */
.icon-warning    /* Ambra (#f59e0b) */
.icon-danger     /* Rosso (#ef4444) */
.icon-muted      /* Grigio (#6b7280) */
```

### **Stati Interattivi**
```css
.icon-interactive  /* Hover + click effects */
.icon-spin        /* Rotazione continua */
.icon-pulse       /* Pulsazione */
.icon-bounce      /* Rimbalzo */
```

---

## 📋 Esempi Pratici

### **Navigazione**
```typescript
import IconHome from '~icons/tabler/home';
import IconArrowLeft from '~icons/tabler/arrow-left';
import IconMenu from '~icons/tabler/menu-2';

<button className="nav-button">
  <IconHome className="icon-md icon-current" />
  Home
</button>

<button onClick={onGoBack}>
  <IconArrowLeft className="icon-sm icon-interactive" />
  Indietro
</button>
```

### **Form e Input**
```typescript
import IconSearch from '~icons/tabler/search';
import IconEye from '~icons/tabler/eye';
import IconEyeOff from '~icons/tabler/eye-off';

<div className="relative">
  <IconSearch className="icon-sm icon-muted absolute left-3 top-3" />
  <input className="pl-10" placeholder="Cerca..." />
</div>

<button onClick={togglePassword}>
  {showPassword ? 
    <IconEyeOff className="icon-sm icon-interactive" /> : 
    <IconEye className="icon-sm icon-interactive" />
  }
</button>
```

### **Stati e Feedback**
```typescript
import IconCheck from '~icons/tabler/check';
import IconX from '~icons/tabler/x';
import IconLoader from '~icons/tabler/loader-2';

{/* Loading */}
<IconLoader className="icon-md icon-spin icon-primary" />

{/* Success */}
<IconCheck className="icon-lg icon-success" />

{/* Error */}
<IconX className="icon-md icon-danger" />
```

### **Wine App Specifiche**
```typescript
import IconBottle from '~icons/tabler/bottle';
import IconGlass from '~icons/tabler/glass-full';
import IconStar from '~icons/lucide/star';
import IconTrophy from '~icons/tabler/trophy';

{/* Vino */}
<IconBottle className="icon-lg icon-primary" />

{/* Degustazione */}
<IconGlass className="icon-md icon-secondary" />

{/* Voto */}
<IconStar className="icon-sm icon-warning" />

{/* Classifica */}
<IconTrophy className="icon-xl icon-success" />
```

---

## 🔧 Configurazione Avanzata

### **Personalizzazione Globale**
Le icone sono pre-configurate in `vite.config.ts`:
```typescript
Icons({
  compiler: 'jsx',
  jsx: 'react',
  iconCustomizer(collection, icon, props) {
    props.width = props.width || '24';
    props.height = props.height || '24';
    props.strokeWidth = props.strokeWidth || '2';
    props.strokeLinecap = props.strokeLinecap || 'round';
    props.strokeLinejoin = props.strokeLinejoin || 'round';
  }
})
```

### **Icone Personalizzate**
Per aggiungere icone custom:
1. Crea cartella: `client/src/assets/icons/`
2. Aggiungi file SVG
3. Importa: `import MyIcon from '~icons/custom/my-icon';`

---

## 📚 Risorse e Riferimenti

### **Ricerca Icone**
- **Tabler Icons:** https://tabler-icons.io/
- **Lucide Icons:** https://lucide.dev/icons/
- **Iconify:** https://icon-sets.iconify.design/

### **Naming Convention**
- Usa nomi descrittivi: `user-plus` invece di `add-user`
- Mantieni coerenza con le collezioni originali
- Preferisci Tabler per UI principale, Lucide per complementi

### **Performance**
- Le icone sono tree-shaked automaticamente
- Solo le icone importate sono incluse nel bundle
- Dimensione media: ~1KB per icona

---

## 🛠️ Aggiungere Nuove Collezioni

### **Installazione**
```bash
# Esempio: Material Design Icons
npm install --save-dev @iconify-json/mdi

# Esempio: Heroicons
npm install --save-dev @iconify-json/heroicons
```

### **Utilizzo**
```typescript
// Dopo installazione, disponibili immediatamente
import IconMaterial from '~icons/mdi/account';
import IconHero from '~icons/heroicons/user-solid';
```

### **Aggiornamento Documentazione**
Dopo aver aggiunto nuove collezioni:
1. Aggiorna questa guida
2. Testa le icone nel progetto
3. Documenta convenzioni specifiche
4. Aggiorna esempi se necessario

---

## ✅ Checklist Implementazione

- [x] **Installazione:** unplugin-icons + collezioni
- [x] **Configurazione:** Vite plugin setup
- [x] **TypeScript:** Dichiarazioni moduli
- [x] **Stili:** CSS globale per icone
- [x] **Documentazione:** Guida completa
- [ ] **Test:** Verifica build e funzionamento
- [ ] **Esempi:** Implementazione in componenti esistenti

---

**🎉 Il sistema icone è pronto! Nessuna modifica ai componenti esistenti fino a comando specifico.**
