import { Review } from '@/review/schema/review.schema';
import { User } from '@/user/schema/user.schema';

export class UserReview {
  creator: User;
  reviews: Review[];
}
