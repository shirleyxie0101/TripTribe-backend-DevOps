import { Review } from '@/review/schema/review.schema';
import { User } from '@/user/schema/user.schema';
export interface ReviewCreator extends Review {
  creator: User;
}
