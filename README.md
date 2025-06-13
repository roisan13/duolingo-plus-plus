# DuolingoPlusPlus, AI-Powered Language Learning App

## Descriere Proiect:
Această aplicație web folosește în mod inteligent LLM-urile pentru a îmbunătăți învățarea limbilor străine. User-ul poate folosi platforma pentru a își îmbunătăți skill-urile in mai multe moduri:

1. **Scenarii Interactive cu AI (Text + Voce)**: Userul va interacționa cu AI într-o conversație (conversație text pentru spelling improvement, sau conversație audio), unde va primi feedback despre performanța sa după fiecare reply, dar și la sfârșitul conversației.
3. **AI Pronunciation Coach**: Utilizatorii vor citi propoziții, iar AI-ul va analiza pronunția și va oferi feedback pentru îmbunătățire.
4. **Vocabulary Recommendation System**: În funcție de cuvintele pe care le știe și le folosește cel mai frecvent în conversațiile cu AI, aplicația va recomanda vocabularul adițional ce ar trebui învățat. Metoda foarte bună si eficientă de a imbogăți vocabularul si a nu avea un limbaj repetitiv în limba străină.

## Tehnologii posibile:

### Frontend:
- **React.js** - pentru construirea interfeței interactive a utilizatorului.

### Backend:
- **Python (Flask/Django)** - pentru logica server-side.

### Speech-to-Text & Text-to-Speech:
- **Whisper API** (OpenAI) sau pentru transcrierea audio.
- **ELEVENLABS** pentru generarea de voce.

### Database:
- **Firebase Firestore** - pentru stocarea datelor utilizatorului, inclusiv vocabularul învățat.


## Backlog
### 0. **Stabilirea tehnologiilor, familiarizarea cu acestea**:
- [X] **Cercetare** în privința tehnologiilor care se potrivesc cel mai bine proiectului si satisfac cerințele
- [X] **Alegerea** tehnologiilor și familiarizarea cu acestea.
- [X] **Delegarea** task-urilor în echipă.

### 1. **Scenarii de convesație interactive cu AI (Text + Voce)**:
- [X] **Cercetare** pentru a înțelege cerințele tehnice ale GPT-3.5 pentru integrarea conversației interactive.
- [X] **Creare API pentru interacțiune text**: Implementarea unui sistem simplu de conversație care poate răspunde la întrebări.
- [X] **Creare API pentru interacțiune vocală**: Integrarea **Whisper** și **Google TTS** pentru a suporta conversații vocale.
- [X] **Creare logica feedback**: Construirea unui sistem care să ofere feedback bazat pe conversație (corectitudinea gramaticală, relevanța răspunsurilor)
- [X] **Creare interfață front-end**: Dezvoltarea UI-ului pentru interacțiunea utilizatorului (chatbox, butoane pentru conversații vocale).
- [ ] **Testare**: Testarea funcționalității conversației și integrarea feedback-ului

### 2. **AI Pronunciation Coach**:
- [ ] **Cercetare și alegerea tehnologiei pentru Speech-to-Text**: Folosirea **Whisper** sau pentru analiza audio.
- [ ] **Creare logică de feedback pentru pronunție**: Antrenarea unui model care să analizeze acuratețea pronunției (ex: utilizarea Wav2Vec).
- [ ] **Creare API pentru pronunție**: Crearea unui endpoint care va analiza pronunția utilizatorului.
- [ ] **Interfață front-end pentru pronunție**: Dezvoltarea unei interfețe prin care utilizatorul poate citi propoziții și primi feedback vocal.
- [ ] **Testare**: Verificarea acurateței și preciziei în analiza pronunției.

### 3. **Vocabulary Recommendation System**:
- [X] **Creare model de recomandare vocabular**: Folosirea unui model LLM pentru a analiza vocabularul utilizatorului (primește cele mai frecvent folosite cuvinte și întoarce o lista de cuvinte asemănătoare semantic).
- [X] **Creare API de recomandare**: Construirea unui endpoint care va returna cuvintele recomandate pe baza vocabularului utilizatorului.
- [X] **Integrarea cu Firestore**: Stocarea vocabularului utilizatorului în Firebase Firestore pentru a personaliza recomandările.
- [X] **Creare interfață front-end**: Dezvoltarea UI-ului pentru a prezenta cuvintele recomandate și a le învăța.
- [X] **Testare**: Testarea funcționalității și acurateței recomandărilor.

### 4. **Interacțiune între componente**:
- [X] **Integrarea între scenarii interactive, pronunciation coach și vocabulary recommendation**: Crearea unui flux de utilizator în care toți pașii să fie legați într-un singur flux de învățare.
- [ ] **Testare finală**: Testarea întregii aplicații pentru funcționarea corectă a interacțiunii între funcționalități.

### 5. **Optimizare și Scalable Design**:
- [ ] **Optimizare performanță**: Asigurarea unui timp rapid de răspuns și implementarea unui design scalabil pentru a putea gestiona un număr mare de utilizatori simultan.
- [ ] **Optimizare pentru mobile**: Asigurarea că aplicația functionează bine pe dispozitivele mobile.

### 6. **Documentare și Raportare Bug-uri**:
- [X] **Documentația** specifică implementării funcționalităților aplicației, a folosirii toolurilor de AI.
- [ ] **Documentația de prompt-engineering** folosit cu LLM-urile în dezvoltarea proiectului.
- [ ] **Raportarea și rezolvarea bugurilor** pe măsură ce apar.

### 7. **Testare & Feedback utilizator**:
- [X] **Testare automată** din server-side (posibil si Github).
- [ ] **Testare beta** cu un grup selectat de utilizatori (colegi, prieteni).
- [ ] **Colectare feedback** și implementarea îmbunătățirilor pe baza acestuia.

---

## User stories
1. Ca utilizator, vreau să folosesc o aplicație cât mai ușoară, eficientă și rapidă pentru a practica limba pe care o învăț.

2. Ca utilizator, vreau să primesc feedback despre corectitudinea gramaticală la sfârșitul unei conversații, astfel încât să-mi imbunătătesc abilitățile de comunicare.

3. Ca utilizator, vreau să dobandesc skill-uri conversaționale în limba pe care o studiez în mod cât mai eficient.

4. Ca utilizator, vreau să am posibilitatea de a-mi compara direct pronunția cu una nativă.

5. Ca utilizator, vreau să îmi dezvolt cât mai eficient vocabularul, folosind cuvinte cât mai potrivite scenariului în care ma aflu.

6. Ca utilizator, vreau să primesc recomandări de vocabular personalizate pe baza cuvintelor pe care le folosesc, astfel încât să îmbogățesc vocabularul meu cât mai ușor.

7. Ca utilizator, vreau să pot salva cuvintele pe care le învăț într-un vocabular personalizat, astfel încât să pot reveni la ele mai târziu.

8. Ca utilizator, vreau să pot interacționa cu AI prin voce, astfel încât să pot exersa ascultarea și vorbirea într-un mod natural.

9. Ca utilizator, vreau să pot selecta nivelul de dificultate al conversațiilor cu AI, astfel încât să încep de la un nivel de bază și să progresez treptat.

10. Ca utilizator, vreau să pot urmări progresul meu în învățarea limbii, astfel încât să știu ce cuvinte și concepte am învățat și ce trebuie să mai exersez.


## Estimări de Timp:

Fiecare task va fi supravegheat de întreaga echipa, pentru corectarea greșelilor si facilitarea unui sistem eficient de învățare. 

1. **Dezvoltare Front-End** (2-3 persoane): Interfața utilizatorului, integrarea componentelor UI.  
2. **Dezvoltare Back-End** (2 persoane): Implementarea logica server-side, API-uri, integrarea ML.  
3. **Specialist ML** (1 persoană): Crearea și antrenarea modelelor de ML pentru recomandări vocabular și analiză pronunție.


