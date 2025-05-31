import { db, bucket } from "@/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import dayjs from "dayjs";
import { COLLECTIONS } from "@/firebase/constants";

const COLLECTION = COLLECTIONS.STORE;

// Image related

export const uploadImageFromLocal = async ({
  imagePath, // e.g. "/Users/vincent/Downloads/testrestaurant.jpeg"
  storeId, // e.g. "1q43mSYauZchHnemuVL5"
  fileName, // e.g. "new-image2.png"
}: {
  imagePath: string;
  storeId: string;
  fileName: string;
}) => {
  // TODO: might need a dynamic file name
  const destination = `${COLLECTION}/${storeId}/${fileName}`;
  const options = {
    destination,
    validation: "crc32c",
  };
  try {
    await new Promise((resolve) => {
      bucket.upload(imagePath, options, function (err, file, apiResponse) {
        resolve({ err, file, apiResponse });
        // Your bucket now contains:
        // - "image.png" (with the contents of `/local/path/image.png')
        // `file` is an instance of a File object that refers to your new file.
      });
    });

    const storeRef = db.collection(COLLECTION).doc(storeId);
    await storeRef.update({
      images: FieldValue.arrayUnion(destination),
    });
  } catch (err) {
    console.log("upload image fail");
    throw err;
  }
};

export const getImagesByPath = async (imagesPath: string[]) => {
  // const sevenDaysAfter = dayjs().add(7, "day").format("MM-DD-YYYY");

  // // * get images here
  // const imagesArr = imagesPath.map((imagePath: string) => {
  //   return bucket
  //     .file(imagePath)
  //     .getSignedUrl({ action: "read", expires: sevenDaysAfter });
  // });
  // const imagesUrl = await Promise.all(imagesArr);
  // const images = imagesUrl.map((image) => image[0]);

  if (!imagesPath || imagesPath.length === 0) return [];
  const imagePathPromises = imagesPath.map((imagePath) => {
    return getImageByPath(imagePath);
  });
  const imagesUrl = await Promise.all(imagePathPromises);

  return imagesUrl;
};

export const getImageByPath = async (imagePath: string) => {
  const sevenDaysAfter = dayjs().add(7, "day").format("MM-DD-YYYY");
  const image = await bucket
    .file(imagePath)
    .getSignedUrl({ action: "read", expires: sevenDaysAfter });
  return image[0];
};
