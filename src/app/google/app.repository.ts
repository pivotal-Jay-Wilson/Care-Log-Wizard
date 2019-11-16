import { Injectable } from '@angular/core';
import { UserRepository } from './user.repository';

@Injectable()
export class AppRepository {
    constructor(
        private userRepository: UserRepository
    ) {

    }
    get User(): UserRepository {
        return this.userRepository;
    }
}
