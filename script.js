'use strict';

 

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let map,mapEvent;

class workout{
     
    date=new Date();
    id=(Date.now()+"").slice(-10);
    
    constructor(duration,distance,coords){
        this.date=this.date,
        this.id=this.id,
     this.duration=duration,
     this.distance =distance,
     this.coords=coords;
    
    }
  _description(){
    // prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
// console.log(this.description)
  }
}
class Running extends workout{
    type='running'
    constructor(duration,distance,coords,cadence){
        super(duration,distance,coords)
        this.cadence=cadence,
        this.calcPace(),
        this._description();
    }
    calcPace(){
        this.pace=this.duration/this.distance;
        return this.pace;
    }
}

class cycling extends workout{
    type='cycling'
    constructor(duration,distance,coords,elevationGain){
        super(duration,distance,coords)
        this.elevationGain=elevationGain,
        this.calcSpeed(),
        this._description();
    }
    calcSpeed(){
        this.speed=this.distance/(this.duration/60).toFixed(1);
       
        return this.speed;
    }
}

class App{
    #map;
    #mapEvent;
    #workout=[]
    constructor(){
        this._getLocaStorage();
        this._getLocation();
        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change',this._eventToggle);
        containerWorkouts.addEventListener('click',this._moveMarker.bind(this))
    }


    _getLocation(){
        navigator.geolocation.getCurrentPosition(  this._loadMap.bind(this),function(){
            alert('not found') })
    }


    _loadMap(postion){
        const {latitude}=postion.coords;
        const {longitude}=postion.coords;
        const coords=[latitude,longitude]
    
         this.#map = L.map('map').setView(coords, 13);
    
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
     
    // console.log(latitude,longitude)
    this.#map.on("click",this._showForm.bind(this))

    this.#workout.forEach(work => {
      this._renderMarker(work);
    });
    }


    _showForm(event){
        this.#mapEvent=event;
       form.classList.remove('hidden') 
        inputDistance.focus()
    }
     

    _hideForm(){
      
       inputCadence.value=inputDistance.value=inputElevation.value=inputDuration.value=''
      form.style.display='none';
      form.classList.add('hidden'); 
      setTimeout(()=>form.style.display='grid',1000)
    }

    _eventToggle(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }


    _newWorkout(e){
         
        e.preventDefault();
        const number=(...inputs)=>inputs.every((input)=>Number.isFinite(input));
        const Positive=(...numbes)=>numbes.every((number)=>number>0);
        // get data from form
        const type=inputType.value;
        const Distance=+inputDistance.value;
        const Duration=+inputDistance.value;
        const {lat,lng}=this.#mapEvent.latlng;
        let workout;
        //check if data is valid

        //if wirkoout is running then create object Running
          if(type==='running'){
            const Cadence=+inputCadence.value;
            // console.log(Cadence ,"cadence")
            if(!number(Distance,Duration,Cadence) || !Positive(Distance,Duration,Cadence))
         return alert('not a number or contains negative values');
        
            workout=new Running(Duration,Distance,[lat,lng],Cadence)
         
          }
       //if wirkoout is cycling then create object Cycling
       if(type==='cycling'){
        const elevation=+inputElevation.value;
        if(!number(Distance,Duration,elevation) || !Positive(Distance,Duration))
         return alert('not a number or contains negative values');
          workout=new cycling(Duration,Distance,[lat,lng],elevation)
 
      }
       // Add new  object into workout array

       // Render workout   on map as marker
         this._renderMarker(workout);
       //Render workout List
         this._renderList(workout);
       // clear the form
        this._hideForm(); 
       this.#workout.push(workout);
           // Set local storage to all workouts
         this._setLocalStorage();
    }
      _renderMarker(workout) {
         L.marker(workout.coords).addTo(this.#map)
        .bindPopup( L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`
        }))
        .setPopupContent(`${workout.type==='running' ?"🏃‍♂️":"🚴‍♀️"} ${workout.description}`)
        .openPopup();
    };
 
    _renderList(workout){
        let html=
         `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type==='running' ?"🏃‍♂️":"🚴‍♀️"} </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div> `;
          if(workout.type==="running"){
          html +=  `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div> </li>`
          };
          if(workout.type==="cycling"){
           html += ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `
          }
          form.insertAdjacentHTML('afterend',html);
          // form.innerHTML=html; 
          // console.log(workout.description)
    }
     
    _moveMarker(e){
     const workoutel= e.target.closest('.workout');
     if(!workoutel) return;
     const workout=this.#workout.find(work=>work.id===workoutel.dataset.id)
     this.#map.setView(workout.coords,13,{
      animate:true,
      pan:{
        duration:1
      },
     })
    //  console.log(workoutel)
    }
    _setLocalStorage(){
      localStorage.setItem('workouts',JSON.stringify(this.#workout))
    }
    _getLocaStorage(){
      const data= JSON.parse(localStorage.getItem('workouts'));
      if(!data)return;
      this.#workout=data;
      this.#workout.forEach(work=>this._renderList(work))
    }
    reset() {
      localStorage.removeItem('workouts');
      location.reload();
    }
}
 const app=new App(); 
 