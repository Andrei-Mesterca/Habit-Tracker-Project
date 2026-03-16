export function createHabit({
    name,
    description,
    frequency,
    daysOfWeek = [],
    userId,
}) {
    return {
    name,
    frequency,
    daysOfWeek,
    userId,
    createdAt: new Date(),
};
}

async function isHabitComplete(habitId){
    let isCompleted = false;
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth()+1;
    const day = d.getDate();
    const date = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');
    const uid = resolveUid(uidOrRef);
    if (!uid) throw new Error("No uid available yet");
    const docRef = doc(db, "users", uid, "habit", habitId);

    const snap = await getDoc(docRef);

    if (!snap.exists()){
        throw new Error("snap doesn't exist");
    }

    const daily = snap.data().frequency?.equals("daily");
    const weekly = snap.data().frequency?.equals("weekly"); 
    if (daily){
        //if the habit is completed daily
        const completed = snap.data().completedDays?.includes(date);

        isCompleted = true;
    }
    else if(weekly){
        const dayWeek = d.getDay();
        const mondayIndex = (dayWeek === 0 ? 6 : dayWeek -1);
        const mondayDate = new Date(d);
        mondayDate.setDate(mondayDate.getDate() - mondayIndex);
        let y = mondayDate.getFullYear();
        let m = mondayDate.getMonth()+1;
        let day = mondayDate.getDate();
        const monDate = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');
        const sundayDate = new Date(d);
        sundayDate.setDate(sundayDate.getDate() + (6 - mondayIndex));
        y = sundayDate.getFullYear();
        m = sundayDate.getMonth()+1;
        day = sundayDate.getDate();
        const sunDate = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');
        const completed = snap.data().completedDays?.some(date => date>=monDate && date <= sunDate);

        if(completed){
            isCompleted = true;
        }

    }
    return isCompleted;

}