import { faker } from '@faker-js/faker';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Attraction, DurationEnum, TypeEnum } from '@/attraction/schema/attraction.schema';
import { CuisineEnum, MealEnum, Restaurant } from '@/restaurant/schema/restaurant.schema';
import { Review } from '@/review/schema/review.schema';
import { Photo } from '@/schema/photo.schema';
import { User } from '@/user/schema/user.schema';

import { geoLocationFaker } from './data/location';
import { IAddress } from './types/interfaces/address.do';
import { IAttraction } from './types/interfaces/attraction.do';
import { IBusinessTime, IPeriod } from './types/interfaces/businessTime.do';
import { IPhoto } from './types/interfaces/photo.do';
import { IRestaurant } from './types/interfaces/restaurant.do';
import { IReview, PlaceType } from './types/interfaces/review.do';
import { IUser } from './types/interfaces/user.do';

@Injectable()
export class FakerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Attraction.name) private attractionModel: Model<Attraction>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Photo.name) private photoModel: Model<Photo>
  ) {}

  onModuleInit() {
    this.connectToDatabase();
  }

  onModuleDestroy() {
    this.closeDatabaseConnection();
  }

  private async connectToDatabase(): Promise<void> {
    const DATABASE_URI = this.configService.get('database.uri');
    await mongoose.connect(DATABASE_URI);
    console.log('Connected to MongoDB');
  }

  private async closeDatabaseConnection(): Promise<void> {
    await mongoose.connection.close();
    console.log('Closed MongoDB connection');
  }

  createRandomUser(isFixed): IUser {
    const password: string = isFixed ? 'Abc123456+' : faker.internet.password({ length: 8 });
    const firstName: string = faker.person.firstName();
    const lastName: string = faker.person.lastName();
    const email: string = isFixed
      ? 'triptribeuser@triptribe.com'
      : faker.string.alpha(4) + faker.internet.email({ firstName, lastName });
    const nickname: string =
      faker.string.alpha(4) + faker.internet.userName({ firstName, lastName });
    const description: string = faker.person.bio();
    const imageAlt: string = 'User Avatar';
    const imageUrl: string = faker.internet.avatar();
    const imageType: string = 'User';
    const uploadUserId: string = faker.database.mongodbObjectId();
    const userAvatar: IPhoto = {
      imageAlt,
      imageUrl,
      imageType,
      uploadUserId,
    };

    return {
      email,
      password,
      nickname,
      firstName,
      lastName,
      description,
      savedAttractions: [],
      savedRestaurants: [],
      userAvatar,
    };
  }

  async generateFakeUsers(fakeUserQty: number): Promise<void> {
    for (let i = 0; i < fakeUserQty; i++) {
      const user: IUser = this.createRandomUser(false);
      const createdUser = new this.userModel(user);
      await createdUser.save();
      // update userAvatar.uploadUserId field
      const newUser = await this.userModel.findOne({ email: user.email });
      await this.userModel.updateOne(
        { _id: newUser?._id },
        { $set: { [`userAvatar.uploadUserId`]: newUser?._id } },
        { new: true }
      );
    }
  }

  async generateFixedUser(): Promise<void> {
    const user: IUser = this.createRandomUser(true);
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) return;

    const createdUser = new this.userModel(user);
    await createdUser.save();
    // update userAvatar.uploadUserId field
    const newUser = await this.userModel.findOne({ email: user.email });
    await this.userModel.updateOne(
      { _id: newUser?._id },
      { $set: { [`userAvatar.uploadUserId`]: newUser?._id } },
      { new: true }
    );
  }

  async generateFakePhoto(fakePhoto: IPhoto): Promise<void> {
    const createdPhoto = new this.photoModel(fakePhoto);
    await createdPhoto.save();
  }

  getRandomOptionsSubset = (Data_Options: string[]) => {
    const subsetLength = faker.number.int({ min: 1, max: Data_Options.length });
    const randomOptionsSubset = faker.helpers.shuffle(Data_Options).slice(0, subsetLength);
    return randomOptionsSubset;
  };

  async createRandomAttraction(userId: string): Promise<IAttraction> {
    const name: string = faker.location.street();
    const description: string = faker.lorem.text();
    const website: string = faker.internet.url({ protocol: 'http', appendSlash: false });
    const email: string = faker.internet.email({ firstName: name });
    const phone: string = faker.phone.number();
    const isOpenAllDay: boolean = false;
    const isClosed: boolean = false;
    const openTime: string = '06:00';
    const closeTime: string = '18:00';
    const period: IPeriod[] = [{ openTime, closeTime }];
    const businessTime: IBusinessTime = { isOpenAllDay, isClosed, period };
    const openHours: IAttraction['openHours'] = {
      Monday: businessTime,
      Tuesday: businessTime,
      Wednesday: businessTime,
      Thursday: businessTime,
      Friday: businessTime,
      Saturday: businessTime,
      Sunday: businessTime,
    };

    const formattedAddress: string = faker.location.streetAddress({ useFullAddress: true });

    const { lat: originLat, lon: originLng } = geoLocationFaker[Math.floor(Math.random() * 10)];
    const [lat, lng] = faker.location.nearbyGPSCoordinate({ origin: [originLat, originLng] });

    // const lng: number = faker.location.longitude({ max: 180, min: -180 });
    // const lat: number = faker.location.latitude({ max: 90, min: -90 });
    const location = { lng, lat };
    const address: IAddress = { formattedAddress, location };
    const overAllRating: number = 0;
    const photos: IPhoto[] = [];
    const photosQty = 10;
    for (let i = 0; i < photosQty; i++) {
      const imageAlt: string = `Attraction photo ${i}`;
      const imageType: string = 'Attraction';
      const uploadUserId: string = userId;
      const imageUrl: string = faker.image.urlLoremFlickr({ category: 'attraction' });
      const photo: IPhoto = {
        imageAlt,
        imageUrl,
        imageType,
        uploadUserId,
      };
      await this.generateFakePhoto(photo);
      photos.push(photo);
    }

    const createdUserId: string = userId;

    const TYPES_OPTION = [
      TypeEnum.SIGHT_AND_LANDMARKS,
      TypeEnum.NATURE_AND_PARKS,
      TypeEnum.MUSEUMS,
      TypeEnum.FUN_AND_GAMES,
      TypeEnum.NIGHTLIFE,
    ];
    const DURATIONS_OPTION = [
      DurationEnum.UP_TO_ONE_HOUR,
      DurationEnum.ONE_TO_FOUR_HOURS,
      DurationEnum.FOUR_HOURS_TO_ONE_DAY,
    ];

    const tags = {
      types: this.getRandomOptionsSubset(TYPES_OPTION),
      durations: this.getRandomOptionsSubset(DURATIONS_OPTION),
      cost: Number(faker.finance.amount(5, 200, 0)),
    };

    return {
      name,
      description,
      website,
      email,
      phone,
      openHours,
      address,
      overAllRating,
      photos,
      createdUserId,
      tags,
    };
  }

  async generateFakeAttractions(fakeAttractionsQty: number): Promise<void> {
    const users = await this.userModel.find().limit(fakeAttractionsQty);
    for (let i = 0; i < fakeAttractionsQty; i++) {
      const attraction: IAttraction = await this.createRandomAttraction(users[i]._id.toString());
      const createdAttraction = new this.attractionModel(attraction);
      await createdAttraction.save();
    }
  }

  async createRandomRestaurant(userId: string): Promise<IRestaurant> {
    const name: string = faker.location.street();
    const description: string = faker.lorem.text();
    const website: string = faker.internet.url({ protocol: 'http', appendSlash: false });
    const email: string = faker.internet.email({ firstName: name });
    const phone: string = faker.phone.number();
    const isOpenAllDay: boolean = false;
    const isClosed: boolean = false;
    const openTime: string = '06:00';
    const closeTime: string = '18:00';
    const period: IPeriod[] = [{ openTime, closeTime }];
    const businessTime: IBusinessTime = { isOpenAllDay, isClosed, period };
    const openHours: IRestaurant['openHours'] = {
      Monday: businessTime,
      Tuesday: businessTime,
      Wednesday: businessTime,
      Thursday: businessTime,
      Friday: businessTime,
      Saturday: businessTime,
      Sunday: businessTime,
    };

    const formattedAddress: string = faker.location.streetAddress({ useFullAddress: true });

    const { lat: originLat, lon: originLng } = geoLocationFaker[Math.floor(Math.random() * 10)];
    const [lat, lng] = faker.location.nearbyGPSCoordinate({ origin: [originLat, originLng] });

    // const lng: number = faker.location.longitude({ max: 180, min: -180 });
    // const lat: number = faker.location.latitude({ max: 90, min: -90 });
    const location = { lng, lat };
    const address: IAddress = { formattedAddress, location };
    const overAllRating: number = 0;
    const photos: IPhoto[] = [];
    const photosQty = 10;
    for (let i = 0; i < photosQty; i++) {
      const imageAlt: string = `Restaurant photo ${i}`;
      const imageType: string = 'Restaurant';
      const uploadUserId: string = userId;
      const imageUrl: string = faker.image.urlLoremFlickr({ category: 'restaurant' });
      const photo: IPhoto = {
        imageAlt,
        imageUrl,
        imageType,
        uploadUserId,
      };
      await this.generateFakePhoto(photo);
      photos.push(photo);
    }

    const createdUserId: string = userId;

    const MEALS_OPTION = [MealEnum.BREAKFAST, MealEnum.BRUNCH, MealEnum.LUNCH, MealEnum.DINNER];
    const CUISINES_OPTION = [
      CuisineEnum.AUSTRALIAN,
      CuisineEnum.ASIAN,
      CuisineEnum.CAFE,
      CuisineEnum.ITALIAN,
    ];

    const tags = {
      meals: this.getRandomOptionsSubset(MEALS_OPTION),
      cuisines: this.getRandomOptionsSubset(CUISINES_OPTION),
      cost: Number(faker.finance.amount(5, 200, 0)),
    };

    return {
      name,
      description,
      website,
      email,
      phone,
      openHours,
      address,
      overAllRating,
      photos,
      createdUserId,
      tags,
    };
  }

  async generateFakeRestaurants(fakeRestaurantsQty: number): Promise<void> {
    const users = await this.userModel.find().limit(fakeRestaurantsQty);
    for (let i = 0; i < fakeRestaurantsQty; i++) {
      const restaurant: IRestaurant = await this.createRandomRestaurant(users[i]._id.toString());
      const createdRestaurant = new this.restaurantModel(restaurant);
      await createdRestaurant.save();
    }
  }

  async createRandomReviews(
    userId: string,
    placeId: string,
    placeType: PlaceType
  ): Promise<IReview> {
    const title: string = faker.lorem.words({ min: 3, max: 8 });
    const description: string = faker.lorem.paragraph({ min: 1, max: 3 });
    const rating: number = faker.helpers.rangeToNumber({ min: 1, max: 5 });
    const photos: IPhoto[] = [];
    const photosQty = 5;
    for (let i = 0; i < photosQty; i++) {
      const imageAlt: string = `${placeType} ${placeId} review photo ${i}`;
      const imageType: string = 'Review';
      const uploadUserId: string = userId;
      const imageUrl: string =
        placeType === PlaceType.RESTAURANT
          ? faker.image.urlLoremFlickr({ category: 'restaurant' })
          : faker.image.urlLoremFlickr({ category: 'attraction' });
      const photo: IPhoto = {
        imageAlt,
        imageUrl,
        imageType,
        uploadUserId,
      };
      await this.generateFakePhoto(photo);
      photos.push(photo);
    }

    return {
      title,
      description,
      rating,
      photos,
      userId,
      placeId,
      placeType,
    };
  }

  async generateFakeReviewsForAttractions(fakeAttractionsQty: number): Promise<void> {
    const users = await this.userModel.find().limit(fakeAttractionsQty);
    const attractions = await this.attractionModel.find();
    for (let i = 0; i < fakeAttractionsQty; i++) {
      for (let j = 0; j < attractions.length; j++) {
        const review: IReview = await this.createRandomReviews(
          users[i]._id.toString(),
          attractions[j]._id.toString(),
          PlaceType.ATTRACTION
        );
        const createdReviewForAttraction = new this.reviewModel(review);
        await createdReviewForAttraction.save();
      }
    }
  }

  async generateFakeReviewsForRestaurants(fakeRestaurantsQty: number): Promise<void> {
    const users = await this.userModel.find().limit(fakeRestaurantsQty);
    const restaurants = await this.restaurantModel.find();
    for (let i = 0; i < fakeRestaurantsQty; i++) {
      for (let j = 0; j < restaurants.length; j++) {
        const review: IReview = await this.createRandomReviews(
          users[i]._id.toString(),
          restaurants[j]._id.toString(),
          PlaceType.RESTAURANT
        );
        const createdReviewForRestaurant = new this.reviewModel(review);
        await createdReviewForRestaurant.save();
      }
    }
  }

  async updateAveRating(): Promise<void> {
    const pipeline = [
      {
        $group: {
          _id: '$placeId',
          placeType: { $first: '$placeType' },
          averageRating: { $avg: '$rating' },
        },
      },
    ];

    const averageRatings = await this.reviewModel.aggregate(pipeline);
    for (const averageRating of averageRatings) {
      if (averageRating.placeType === PlaceType.ATTRACTION) {
        await this.attractionModel.findByIdAndUpdate(
          averageRating._id,
          {
            overAllRating: Number(averageRating.averageRating).toFixed(1),
          },
          { new: true }
        );
      } else if (averageRating.placeType === PlaceType.RESTAURANT) {
        await this.restaurantModel.findByIdAndUpdate(
          averageRating._id,
          {
            overAllRating: Number(averageRating.averageRating).toFixed(1),
          },
          { new: true }
        );
      }
    }
  }

  async generateFakeData(): Promise<void> {
    const fakeUserQty: number = 100;
    const fakeAttractionsQty: number = 100;
    const fakeRestaurantsQty: number = 100;

    if (fakeUserQty < fakeAttractionsQty || fakeUserQty < fakeRestaurantsQty) {
      return console.log(
        'Error: The fakeUserQty must greater than fakeAttractionsQty and fakeRestaurantsQty'
      );
    }

    await this.generateFixedUser();
    await this.generateFakeUsers(fakeUserQty);
    await this.generateFakeAttractions(fakeAttractionsQty);
    await this.generateFakeRestaurants(fakeRestaurantsQty);
    await this.generateFakeReviewsForAttractions(fakeAttractionsQty);
    await this.generateFakeReviewsForRestaurants(fakeRestaurantsQty);
    await this.updateAveRating();

    console.log('Fake data inserted successfully!');
  }
}
