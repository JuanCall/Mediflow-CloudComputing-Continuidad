const admin = require('./firebaseAdmin');
const db = admin.firestore();

const crearSuperAdmin = async () => {
    // CREDENCIALES
    const adminEmail = "n00323892@upn.pe";
    const adminPassword = "n.00323892";
    const adminName = "Juan (Admin)";

    try {
        console.log("⏳ Creando usuario en Firebase Auth...");
        const userRecord = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: adminName,
        });

        console.log("⏳ Guardando rol en Firestore...");
        await db.collection('usuarios').doc(userRecord.uid).set({
            nombreCompleto: adminName,
            email: adminEmail,
            rol: 'Admin',
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ ¡Super Administrador creado con éxito!");
        console.log(`📧 Correo: ${adminEmail}`);
        console.log(`🔑 UID: ${userRecord.uid}`);
        process.exit(0); // Cierra el script exitosamente
    } catch (error) {
        console.error("❌ Error al crear el admin:", error.message);
        process.exit(1);
    }
};

crearSuperAdmin();