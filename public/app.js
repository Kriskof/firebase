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
                        return `<li>${ doc.data().name }</li>`
                    });

                    booksList.innerHTML = items.join('');
                }
            });

    } else {
        unsubscribe && unsubscribe();

        booksList.innerHTML = '';
    }
})