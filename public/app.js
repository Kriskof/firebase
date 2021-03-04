const auth = firebase.auth();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const userDetails = document.getElementById('userDetails');

const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => auth.signInWithPopup(provider);

signOutBtn.onclick = () => auth.signOut();


auth.onAuthStateChanged(user => {
    if (user) {
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        userDetails.innerHTML = `<p>Email: ${user.email}</p> <h3> Hello ${user.displayName}!</h3>`;
    } else {
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = '';
    }
});



const db = firebase.firestore();

const createThing = document.getElementById('createThing');
const booksList = document.getElementById('booksList');

let thingsRef;
let unsubscribe;

auth.onAuthStateChanged(user => {
    if (user) {
        thingsRef = db.collection('things')

        createThing.onclick = () => {

            const { serverTimestamp } = firebase.firestore.FieldValue;

            thingsRef.add({
                uid: user.uid,
                name: faker.commerce.productName(),
                createdAt: serverTimestamp()
            });
        }

        unsubscribe = thingsRef
            .where('uid', '==', user.uid)
            .onSnapshot(querySnapshot => {
                if(querySnapshot.empty){
                    booksList.innerHTML = `There are no items.`;
                } else {
                    const items = querySnapshot.docs.map(doc => {
                        return `<li class="no-bullets">
                            <input type="checkbox" id="${doc.data().name}" name="books" value="${doc.data().name}">
                            <label for="${doc.data().name}" class="strikethrough">${ doc.data().name }</label>
                            </li>`
                    });

                    booksList.innerHTML = items.join('');
                }
            });

        function getSelectedCheckboxValues(name){
            const cb = document.querySelectorAll(`input[name="${name}"]:checked`);
            let books = [];

            cb.forEach((checkbox) => {
                books.push(checkbox.value);
            });
        
            return books;
        }
        
        const deleteBtn = document.getElementById('deleteSelected');
        
        deleteBtn.addEventListener('click', (e) => {
            // thingsRef.where('uid', '==', user.uid)
            // .onSnapshot(querySnapshot => {
            //     for(book in books){
            //         if(book == `${doc.data().name}`){
            //             book.delete();
            //         }
            //     }
            // })
            alert(getSelectedCheckboxValues('books'));
        })
        

    } else {
        unsubscribe && unsubscribe();

        booksList.innerHTML = '';
    }
})

