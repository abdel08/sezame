export async function uploadPhotoToServer(file: File, produitId: string) {
    console.log('uploadPhotoToServer appelé depuis lib/uploadPhoto.ts');
  
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const path = `interventions/${produitId}`;
  
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            // On retire le préfixe "data:image/jpeg;base64," ou "data:image/png;base64," etc.
            const base64String = result.split(',')[1];
            resolve(base64String);
          } else {
            reject('Erreur conversion base64');
          }
        };
        reader.onerror = reject;
      });
  
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileContentBase64: base64, path }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Erreur upload photo :', result);
        return null;
      }
  
      return {
        name: file.name,
        url: result.url,
        path: `${path}/${fileName}`,
      };
    } catch (err) {
      console.error('Erreur upload photo catch :', err);
      return null;
    }
  }
  