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
            .orderBy("createdAt", "desc")
            .onSnapshot(querySnapshot => {
                if(querySnapshot.empty){
                    booksList.innerHTML = `There are no items.`;
                    deleteBtn.hidden = true;
                } else {
                    const items = querySnapshot.docs.map(doc => {
                        return `<li>
                            <input type="checkbox" id="${doc.id}" name="books" value="${doc.data().name}">
                            <label for="${doc.id}" class="strikethrough">${ doc.data().name }</label>
                            </li>`
                    });

                    booksList.innerHTML = items.join('');
                    deleteBtn.hidden = false;
                }
            });

        function getSelectedCheckboxValues(name){
            const cb = document.querySelectorAll(`input[name="${name}"]:checked`);

            let books = new Map();

            cb.forEach((checkbox) => {
                books.set(checkbox.id, checkbox.value);
            });
        
            return books;
        }
        
        const deleteBtn = document.getElementById('deleteSelected');
        
        deleteBtn.addEventListener('click', (e) => {
            getSelectedCheckboxValues('books').forEach((value, key, map) => {
                thingsRef.doc(`${key}`).delete().then(() => {
                    console.log("Successfully deleted");
                })
            })
        })
        

    } else {
        unsubscribe && unsubscribe();

        booksList.innerHTML = '';
    }
})

